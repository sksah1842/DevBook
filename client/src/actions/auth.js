import api from '../utils/api';
import { setAlert } from './alert';
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  TWO_FA_SETUP_SUCCESS,
  TWO_FA_SETUP_FAIL,
  TWO_FA_VERIFY_SUCCESS,
  TWO_FA_VERIFY_FAIL,
  TWO_FA_DISABLE_SUCCESS,
  TWO_FA_DISABLE_FAIL,
  TWO_FA_REQUIRED,
  CLEAR_TWO_FA_SETUP,
} from './types';

// Load User
export const loadUser = () => async (dispatch) => {
  try {
    const res = await api.get('/auth');

    dispatch({
      type: USER_LOADED,
      payload: res.data,
    });
  } catch (err) {
    dispatch({ type: AUTH_ERROR });
  }
};

// Register User
export const register =
  ({ name, email, githubusername, password }) =>
  async (dispatch) => {
    const body = { name, email, githubusername, password };

    try {
      const res = await api.post('/users', body);

      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data,
      });

      dispatch(loadUser());
    } catch (err) {
      const errors = err.response.data.errors;
      if (errors) {
        errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
      }

      dispatch({ type: REGISTER_FAIL });
    }
  };

// Login User
export const login = (email, password) => async (dispatch) => {
  const body = { email, password };

  try {
    const res = await api.post('/auth', body);

    // Check if 2FA is required
    if (res.data.requires2FA) {
      dispatch({
        type: TWO_FA_REQUIRED,
        payload: res.data,
      });
      return res.data;
    }

    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    });

    dispatch(loadUser());
  } catch (err) {
    const errors = err.response?.data?.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }

    dispatch({ type: LOGIN_FAIL });
  }
};

// Logout/Clear Profile
export const logout = () => (dispatch) => {
  dispatch({ type: LOGOUT });
};

// Setup 2FA
export const setup2FA = () => async (dispatch) => {
  try {
    const res = await api.post('/auth/2fa/setup');
    dispatch({
      type: TWO_FA_SETUP_SUCCESS,
      payload: res.data,
    });
    return res.data;
  } catch (err) {
    // Error alert is already handled by axios interceptor
    dispatch({ type: TWO_FA_SETUP_FAIL });
    throw err;
  }
};

// Verify 2FA Setup
export const verify2FASetup = (token) => async (dispatch) => {
  try {
    const res = await api.post('/auth/2fa/verify-setup', { token });
    dispatch({
      type: TWO_FA_VERIFY_SUCCESS,
    });
    dispatch(setAlert('2FA enabled successfully', 'success'));
    dispatch(loadUser());
    return res.data;
  } catch (err) {
    // Error alert is already handled by axios interceptor
    dispatch({ type: TWO_FA_VERIFY_FAIL });
    throw err;
  }
};

// Disable 2FA
export const disable2FA = (token) => async (dispatch) => {
  try {
    const res = await api.post('/auth/2fa/disable', { token });
    dispatch({
      type: TWO_FA_DISABLE_SUCCESS,
    });
    dispatch(setAlert('2FA disabled successfully', 'success'));
    dispatch(loadUser());
    return res.data;
  } catch (err) {
    // Error alert is already handled by axios interceptor
    dispatch({ type: TWO_FA_DISABLE_FAIL });
    throw err;
  }
};

// Verify 2FA Login
export const verify2FALogin = (tempToken, token) => async (dispatch) => {
  try {
    const res = await api.post('/auth/2fa/verify-login', { tempToken, token });
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    });
    dispatch(loadUser());
    return res.data;
  } catch (err) {
    // Error alert is already handled by axios interceptor
    dispatch({ type: TWO_FA_VERIFY_FAIL });
    throw err;
  }
};

// Clear 2FA Setup
export const clear2FASetup = () => (dispatch) => {
  dispatch({ type: CLEAR_TWO_FA_SETUP });
};

