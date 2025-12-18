import { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { verify2FALogin } from '../../actions/auth';

const TwoFactorVerify = ({ tempToken, verify2FALogin, onCancel }) => {
  const [token, setToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await verify2FALogin(tempToken, token);
    } catch (err) {
      // Error handled by action
    }
  };

  return (
    <div className='container'>
      <div className='form-container'>
        <h1 className='large text-primary'>Two-Factor Authentication</h1>
        <p className='lead'>
          <i className='fas fa-shield-alt'></i> Enter your 2FA code
        </p>
        <div className='alert alert-info'>
          <p>
            Please enter the 6-digit code from your authenticator app to
            complete login.
          </p>
        </div>
        <form className='form' onSubmit={handleSubmit}>
          <div className='form-group'>
            <input
              type='text'
              placeholder='000000'
              name='token'
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
              maxLength='6'
              pattern='[0-9]{6}'
              required
              autoFocus
            />
          </div>
          <input type='submit' value='Verify' className='btn btn-primary' />
          {onCancel && (
            <button
              type='button'
              className='btn btn-light ml-2'
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

TwoFactorVerify.propTypes = {
  tempToken: PropTypes.string.isRequired,
  verify2FALogin: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, { verify2FALogin })(TwoFactorVerify);



