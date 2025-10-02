import axios from 'axios';

import { store } from '../store';
import { LOGOUT } from '../actions/types';
import { setAlert } from '../actions/alert';

// Create an instance of axios
const api = axios.create({
  // baseURL: '/api',
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/*
  NOTE: intercept any error responses from the api
 and check if the token is no longer valid.
 ie. Token has expired or user is no longer
 authenticated.
 logout the user if the token has expired
*/
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      store.dispatch({ type: LOGOUT });
    }
    // Global popup for 4xx/5xx with message payloads
    if (err.response && err.response.data) {
      const data = err.response.data;
      const messages = [];
      if (typeof data?.error === 'string') messages.push(data.error);
      if (typeof data?.msg === 'string') messages.push(data.msg);
      if (Array.isArray(data?.errors)) messages.push(...data.errors.map((e) => e?.msg).filter(Boolean));
      const message = messages.filter(Boolean).join('\n');
      if (message) {
        store.dispatch(setAlert(message, 'danger'));
      } else {
        const fallback = err.response.statusText || `Request failed (${err.response.status})`;
        store.dispatch(setAlert(fallback, 'danger'));
      }
    } else {
      store.dispatch(setAlert('Network error. Please try again.', 'danger'));
    }
    return Promise.reject(err);
  }
);

export default api;
