const jwt = require('jsonwebtoken');
const config = require('config');

// Get JWT secret from environment or config
const getJWTSecret = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.JWT_SECRET;
  }
  return config.get('jwtSecret');
};

module.exports = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No Token, Authorization Denied' });
  }

  try {
    const decoded = jwt.verify(token, getJWTSecret());

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is invalid' });
  }
};