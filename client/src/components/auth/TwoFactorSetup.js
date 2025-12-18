import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { setup2FA, verify2FASetup, disable2FA, clear2FASetup } from '../../actions/auth';

const TwoFactorSetup = ({
  auth: { user, twoFASetup },
  setup2FA,
  verify2FASetup,
  disable2FA,
  clear2FASetup,
}) => {
  const [step, setStep] = useState('initial'); // 'initial', 'setup', 'verify', 'disable'
  const [token, setToken] = useState('');
  const [disableToken, setDisableToken] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // When twoFASetup becomes available and we're in initial state, move to setup
    if (twoFASetup && step === 'initial') {
      setStep('setup');
      setLoading(false);
    }
  }, [twoFASetup, step]);

  const handleSetup = async () => {
    setLoading(true);
    try {
      await setup2FA();
      // Don't set step here - let useEffect handle it when twoFASetup updates
    } catch (err) {
      // Error handled by action
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await verify2FASetup(token);
      setStep('initial');
      setToken('');
    } catch (err) {
      // Error handled by action
    }
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    try {
      await disable2FA(disableToken);
      setStep('initial');
      setDisableToken('');
    } catch (err) {
      // Error handled by action
    }
  };

  const handleCancel = () => {
    setStep('initial');
    setToken('');
    setDisableToken('');
    setLoading(false);
    clear2FASetup();
  };

  if (step === 'initial') {
    return (
      <div className='my-2'>
        <h2 className='text-primary'>Two-Factor Authentication</h2>
        {user?.twoFactorEnabled ? (
          <>
            <p>
              <i className='fas fa-check-circle text-success' /> 2FA is
              currently enabled
            </p>
            <button
              className='btn btn-danger'
              onClick={() => setStep('disable')}
            >
              Disable 2FA
            </button>
          </>
        ) : (
          <>
            <p>Add an extra layer of security to your account</p>
            <button 
              className='btn btn-primary' 
              onClick={handleSetup}
              disabled={loading}
            >
              {loading ? 'Generating QR Code...' : 'Enable 2FA'}
            </button>
          </>
        )}
      </div>
    );
  }

  if (step === 'setup') {
    if (!twoFASetup) {
      return (
        <div className='my-2'>
          <h2 className='text-primary'>Setup Two-Factor Authentication</h2>
          <p>Loading QR code...</p>
        </div>
      );
    }

    return (
      <div className='my-2'>
        <h2 className='text-primary'>Setup Two-Factor Authentication</h2>
        <div className='alert alert-info'>
          <p>
            <strong>Step 1:</strong> Scan this QR code with Google Authenticator
            or any compatible app:
          </p>
          <div className='text-center my-2'>
            <img
              src={twoFASetup.qrCode}
              alt='QR Code'
              style={{ maxWidth: '300px', border: '1px solid #ddd' }}
            />
          </div>
          <p className='mt-2'>
            <strong>Step 2:</strong> Enter the 6-digit code from your
            authenticator app below to verify and enable 2FA.
          </p>
          <p className='text-muted'>
            <small>
              Manual entry key: <code>{twoFASetup.manualEntryKey}</code>
            </small>
          </p>
        </div>
        <form onSubmit={handleVerify}>
          <div className='form-group'>
            <input
              type='text'
              placeholder='Enter 6-digit code'
              name='token'
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
              maxLength='6'
              pattern='[0-9]{6}'
              required
            />
          </div>
          <button type='submit' className='btn btn-primary'>
            Verify & Enable
          </button>
          <button
            type='button'
            className='btn btn-light ml-2'
            onClick={handleCancel}
          >
            Cancel
          </button>
        </form>
      </div>
    );
  }

  if (step === 'verify' && twoFASetup) {
    return (
      <div className='my-2'>
        <h2 className='text-primary'>Verify Two-Factor Authentication</h2>
        <form onSubmit={handleVerify}>
          <div className='form-group'>
            <label>Enter the 6-digit code from your authenticator app:</label>
            <input
              type='text'
              placeholder='000000'
              name='token'
              value={token}
              onChange={(e) => setToken(e.target.value)}
              maxLength='6'
              pattern='[0-9]{6}'
              required
            />
          </div>
          <button type='submit' className='btn btn-primary'>
            Verify & Enable
          </button>
          <button
            type='button'
            className='btn btn-light ml-2'
            onClick={handleCancel}
          >
            Cancel
          </button>
        </form>
      </div>
    );
  }

  if (step === 'disable') {
    return (
      <div className='my-2'>
        <h2 className='text-primary'>Disable Two-Factor Authentication</h2>
        <div className='alert alert-warning'>
          <p>
            To disable 2FA, please enter a code from your authenticator app to
            confirm.
          </p>
        </div>
        <form onSubmit={handleDisable}>
          <div className='form-group'>
            <label>Enter 6-digit code:</label>
            <input
              type='text'
              placeholder='000000'
              name='disableToken'
              value={disableToken}
              onChange={(e) => setDisableToken(e.target.value)}
              maxLength='6'
              pattern='[0-9]{6}'
              required
            />
          </div>
          <button type='submit' className='btn btn-danger'>
            Disable 2FA
          </button>
          <button
            type='button'
            className='btn btn-light ml-2'
            onClick={handleCancel}
          >
            Cancel
          </button>
        </form>
      </div>
    );
  }

  return null;
};

TwoFactorSetup.propTypes = {
  auth: PropTypes.object.isRequired,
  setup2FA: PropTypes.func.isRequired,
  verify2FASetup: PropTypes.func.isRequired,
  disable2FA: PropTypes.func.isRequired,
  clear2FASetup: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, {
  setup2FA,
  verify2FASetup,
  disable2FA,
  clear2FASetup,
})(TwoFactorSetup);



