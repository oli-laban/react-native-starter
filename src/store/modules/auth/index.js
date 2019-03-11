import * as types from './types';

/**
 * @typedef {Object} authState
 * @property {boolean} loggedIn - Indicates if the user is logged in.
 * @property {boolean} loggingIn - Indicates if the user is currently logging in.
 * @property {string} loginError - The current login error.
 * @property {string} token - The current user's auth token.
 * @property {Object} user - The currently logged in user.
 * @property {boolean} goBackAfterLogin - Indicates if the user should go back after logging in.
 */

/**
 * The initial state for the auth module.
 *
 * @type {authState}
 */
const initialState = {
  loggedIn: false,
  loggingIn: false,
  loginError: false,
  token: null,
  user: null,
  goBackAfterLogin: false,
};

/**
 * The reducer for the auth module.
 *
 * @param {authState} state
 * @param {Object} action
 * @returns {authState} - The updated state.
 */
export default (state = initialState, action) => {
  switch (action.type) {
    case types.SET_LOGGED_IN:
      return {
        ...state,
        loggedIn: true,
        loggingIn: false,
        loginError: false,
        token: action.payload.token,
        user: action.payload.user || state.user,
      };
    case types.SET_LOGGING_IN:
      return {
        ...state,
        loggingIn: action.payload.isLoggingIn,
      };
    case types.SET_LOGIN_ERROR:
      return {
        ...state,
        loginError: action.payload.error,
      };
    case types.SET_LOGGED_OUT:
      return {
        ...state,
        loggedIn: false,
        token: null,
        user: null,
      };
    case types.SET_GO_BACK_AFTER_LOGIN:
      return {
        ...state,
        goBackAfterLogin: action.payload.value,
      };
    default:
      return state;
  }
};
