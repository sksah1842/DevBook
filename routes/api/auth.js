const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const auth = require('../../middleware/auth');
const User = require('../../models/User');

// Get JWT secret from environment or config
const getJWTSecret = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.JWT_SECRET;
  }
  return config.get('jwtSecret');
};

// @route   GET api/auth
// @desc    Test Route
// @access  Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -twoFactorSecret');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth
// @desc    Authenticate User & Get Token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Crendentials' }] });
      }

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        // Return a temporary token that requires 2FA verification
        const tempPayload = {
          user: {
            id: user.id,
            requires2FA: true,
          },
        };
        const tempToken = jwt.sign(tempPayload, getJWTSecret(), {
          expiresIn: 600, // 10 minutes for 2FA verification
        });
        return res.json({
          requires2FA: true,
          tempToken,
          message: 'Please enter your 2FA code',
        });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        getJWTSecret(),
        { expiresIn: 360000 }, // Change to 3600 during production
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error('Error during authentication:',err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/auth/2fa/setup
// @desc    Generate 2FA secret and QR code
// @access  Private
router.post('/2fa/setup', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Generate a secret
    const secret = speakeasy.generateSecret({
      name: `DevBook (${user.email})`,
      issuer: 'DevBook',
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Store the secret temporarily (don't enable 2FA yet)
    user.twoFactorSecret = secret.base32;
    await user.save();

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32,
    });
  } catch (err) {
    console.error('Error setting up 2FA:', err.message);
    console.error(err.stack);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// @route   POST api/auth/2fa/verify-setup
// @desc    Verify 2FA code and enable 2FA
// @access  Private
router.post(
  '/2fa/verify-setup',
  auth,
  [
    check('token', '2FA token is required').isLength({ min: 6, max: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('+twoFactorSecret');
      if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ msg: '2FA setup not initiated' });
      }

      const { token } = req.body;

      // Verify the token
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2, // Allow 2 time steps (60 seconds) of tolerance
      });

      if (!verified) {
        return res.status(400).json({ msg: 'Invalid 2FA code' });
      }

      // Enable 2FA
      user.twoFactorEnabled = true;
      await user.save();

      res.json({ msg: '2FA enabled successfully' });
    } catch (err) {
      console.error('Error verifying 2FA setup:', err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/auth/2fa/verify-login
// @desc    Verify 2FA code during login
// @access  Public
router.post(
  '/2fa/verify-login',
  [
    check('tempToken', 'Temporary token is required').exists(),
    check('token', '2FA token is required').isLength({ min: 6, max: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { tempToken, token } = req.body;

      // Verify the temporary token
      let decoded;
      try {
        decoded = jwt.verify(tempToken, getJWTSecret());
      } catch (err) {
        return res.status(401).json({ msg: 'Invalid or expired token' });
      }

      if (!decoded.user.requires2FA) {
        return res.status(400).json({ msg: '2FA not required for this login' });
      }

      const user = await User.findById(decoded.user.id).select(
        '+twoFactorSecret'
      );
      if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
        return res.status(400).json({ msg: '2FA not enabled for this user' });
      }

      // Verify the 2FA token
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2,
      });

      if (!verified) {
        return res.status(400).json({ msg: 'Invalid 2FA code' });
      }

      // Generate final JWT token
      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        getJWTSecret(),
        { expiresIn: 360000 },
        (err, finalToken) => {
          if (err) throw err;
          res.json({ token: finalToken });
        }
      );
    } catch (err) {
      console.error('Error verifying 2FA login:', err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/auth/2fa/disable
// @desc    Disable 2FA for user
// @access  Private
router.post(
  '/2fa/disable',
  auth,
  [
    check('token', '2FA token is required to disable').isLength({
      min: 6,
      max: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('+twoFactorSecret');
      if (!user || !user.twoFactorEnabled) {
        return res.status(400).json({ msg: '2FA is not enabled' });
      }

      const { token } = req.body;

      // Verify the token before disabling
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2,
      });

      if (!verified) {
        return res.status(400).json({ msg: 'Invalid 2FA code' });
      }

      // Disable 2FA
      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      await user.save();

      res.json({ msg: '2FA disabled successfully' });
    } catch (err) {
      console.error('Error disabling 2FA:', err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
