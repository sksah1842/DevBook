import {
    REGISTER_SUCCESS,
    USER_LOADED,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGOUT,
    ACCOUNT_DELETED,
    TWO_FA_REQUIRED,
    TWO_FA_SETUP_SUCCESS,
    TWO_FA_VERIFY_SUCCESS,
    TWO_FA_DISABLE_SUCCESS,
    CLEAR_TWO_FA_SETUP,
  } from '../actions/types';
  
  const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
    requires2FA: false,
    tempToken: null,
    twoFASetup: null,
  };
  
  const authReducer = (state = initialState, action) => {
    const { type, payload } = action;
  
    switch (type) {
      case USER_LOADED:
        return {
          ...state,
          isAuthenticated: true,
          loading: false,
          user: payload,
        };
      case REGISTER_SUCCESS:
      case LOGIN_SUCCESS:
        return {
          ...state,
          ...payload,
          isAuthenticated: true,
          loading: false,
        };
      case TWO_FA_REQUIRED:
        return {
          ...state,
          requires2FA: true,
          tempToken: payload.tempToken,
          loading: false,
        };
      case TWO_FA_SETUP_SUCCESS:
        return {
          ...state,
          twoFASetup: payload,
        };
      case TWO_FA_VERIFY_SUCCESS:
      case TWO_FA_DISABLE_SUCCESS:
      case CLEAR_TWO_FA_SETUP:
        return {
          ...state,
          twoFASetup: null,
        };
      case AUTH_ERROR:
      case LOGOUT:
      case ACCOUNT_DELETED:
        return {
          ...state,
          token: null,
          isAuthenticated: false,
          loading: false,
          user: null,
          requires2FA: false,
          tempToken: null,
          twoFASetup: null,
        };
      default:
        return state;
    }
  };
  
  export default authReducer;
  