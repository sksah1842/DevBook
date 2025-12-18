import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { login } from '../../actions/auth';
import TwoFactorVerify from './TwoFactorVerify';

const Login = ({ login, isAuthenticated, requires2FA, tempToken }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const handleOnChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    await login(email, password);
  };

  const handleCancel2FA = () => {
    // Reset form and reload page to clear state
    window.location.reload();
  };

  // Redirect Logged in User
  if (isAuthenticated) {
    return <Navigate to='/dashboard' />;
  }

  // Show 2FA verification if required
  if (requires2FA && tempToken) {
    return <TwoFactorVerify tempToken={tempToken} onCancel={handleCancel2FA} />;
  }

  return (
    <section className='container'>
      <h1 className='large text-primary'>Sign In</h1>

      <p className='lead'>
        <i className='fas fa-user-ninja'></i> Sign Into Your Account
      </p>

      <form className='form' onSubmit={handleOnSubmit}>
        <div className='form-group'>
          <input
            type='email'
            placeholder='Email Address'
            name='email'
            value={email}
            onChange={handleOnChange}
            required
          />
        </div>

        <div className='form-group'>
          <input
            type='password'
            placeholder='Password'
            minLength='6'
            name='password'
            value={password}
            onChange={handleOnChange}
            required
          />
        </div>

        <input type='submit' value='Login' className='btn btn-primary' />
      </form>

      <p className='my-1'>
        Don't Have an Account? <Link to='/register'>Sign Up</Link>
      </p>
    </section>
  );
};

Login.propTypes = {
  login: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  requires2FA: PropTypes.bool,
  tempToken: PropTypes.string,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  requires2FA: state.auth.requires2FA,
  tempToken: state.auth.tempToken,
});

export default connect(mapStateToProps, { login })(Login);
