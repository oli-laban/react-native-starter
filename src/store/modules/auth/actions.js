import { logIn as logInRequest } from 'lib/api/auth';
import { navigate, navigateBack } from 'lib/router/navigationService';
import { getFromStorage, saveToStorage, removeFromStorage } from 'lib/storage';
import { showError } from 'lib/errors';
import * as types from './types';

/**
 * @typedef {Object} action
 * @property {string} type
 * @property {any} [payload]
 */

/**
 * @typedef {Function} thunkAction - The function that will be handled by redux-thunk.
 * @param {Function} dispatch
 * @returns {Promise<[any]>}
*/

/**
 * Check whether the user is logged in or not by looking for a token and user
 * in storage. If the user is logged in, dispatch setLoggedIn() to update the auth state.
 *
 * @returns {thunkAction}
 */
export const checkAuthStatus = () => async (dispatch) => {
  const token = await getFromStorage('authToken');
  const user = await getFromStorage('authUser');
  const loggedIn = token && user;

  console.log(`[auth] Checked auth status: user ${!loggedIn ? 'not ' : ''}logged in`);

  if (loggedIn) dispatch(setLoggedIn(token, JSON.parse(user)));

  return loggedIn;
};

/**
 * Log the user into the application. If the login is successful, navigate to the products
 * screen, otherwise, display an error to the user.
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {thunkAction} - The function that will be handled by thunk.
 */
export const logIn = (email, password) => async (dispatch, getState) => {
  console.log(`[auth] Start logging in: ${email}`);

  try {
    dispatch(setLoggingIn(true));

    const response = await logInRequest({ email, password });

    if (response) {
      const { token, user } = response;

      await saveToStorage('authToken', token);
      await saveToStorage('authUser', user, true);

      dispatch(setLoggedIn(token, user));

      if (getState().auth.goBackAfterLogin) {
        console.log('[auth] Logged in. Navigating back to previous screen');

        dispatch(setGoBackAfterLogin(false));

        navigateBack();
      } else {
        console.log('[auth] Logged in. Navigating to Products');

        navigate('Products');
      }
    }
  } catch (error) {
    if (error.status === 401) {
      dispatch(setLoginError(error.message));

      return;
    }

    showError(error.message);
  }

  dispatch(setLoggingIn(false));
};

/**
 * Log a user application by removing their token and information from storage. Once
 * logged out, navigate to the login screen.
 *
 * @param {boolean} goBackAfterLogin
 * @returns {thunkAction} - The function that will be handled by thunk.
 */
export const logOut = () => async (dispatch) => {
  console.log('[auth] Logging user out');

  removeFromStorage('authToken');
  removeFromStorage('authUser');

  dispatch(setLoggedOut());

  navigate('Login');
};

/**
 * Set the user as logging in.
 *
 * @param {boolean} isLoggingIn
 * @returns {action}
 */
export const setLoggingIn = isLoggingIn => ({
  type: types.SET_LOGGING_IN,
  payload: { isLoggingIn },
});

/**
 * Set the user as logged in.
 *
 * @param {string} token
 * @param {Object} user
 * @returns {action}
 */
export const setLoggedIn = (token, user = null) => ({
  type: types.SET_LOGGED_IN,
  payload: { token, user },
});

/**
 * Set the login error.
 *
 * @param {string} error
 * @returns {action}
 */
export const setLoginError = error => ({
  type: types.SET_LOGIN_ERROR,
  payload: { error },
});

/**
 * Set the user as logged out.
 *
 * @returns {action}
 */
export const setLoggedOut = () => ({ type: types.SET_LOGGED_OUT });

/**
 * Set whether the user should go back to the previous screen after logging in.
 *
 * @param {boolean} value
 */
export const setGoBackAfterLogin = value => ({
  type: types.SET_GO_BACK_AFTER_LOGIN,
  payload: { value },
});
