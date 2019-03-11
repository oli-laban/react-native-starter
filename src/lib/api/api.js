import { getStore } from 'store/registry';
import { setLoggedIn, logOut, setGoBackAfterLogin } from 'store/modules/auth/actions';
import { apiConfig } from '../../config';
import { showError } from '../errors';

/**
 * Any api endpoints that do not require the token (Bearer header).
 *
 * @type {string[]}
 */
const excludeBearer = ['/login'];

/**
 * Make a request to the api, using the auth token if necessary.
 *
 * @async
 * @param {string} method - The request method e.g. POST
 * @param {string} urlPath - The path of the endpoint e.g. /login
 * @param {any} body
 * @param {Object<string, string>} extraHeaders
 * @param {boolean} throwGeneralError - If false, any error thrown will be re-thrown.
 * @returns {Promise<any>} - The response body.
 */
export const makeRequest = async (
  method = 'POST',
  urlPath,
  body = {},
  extraHeaders = {},
  throwGeneralError = true,
) => {
  const { url, headers } = apiConfig;
  const store = getStore();
  const { auth } = store.getState();
  const combinedHeaders = { ...headers, ...extraHeaders };

  // If the urlPath isn't in the excludeBearer array, add the token to the Authorization header.
  if (excludeBearer.indexOf(urlPath) === -1 && auth && auth.token) {
    combinedHeaders.Authorization = `Bearer ${auth.token}`;
  }

  const requestOptions = {
    method,
    headers: combinedHeaders,
  };

  // Don't add even an empty body to a GET request, as this would throw an error.
  if (method !== 'GET') requestOptions.body = JSON.stringify(body);

  console.log(`[api] Making ${method} request to ${url}${urlPath} with data: `, body);

  try {
    const response = await fetch(`${url}${urlPath}`, requestOptions);

    const responseData = await response.json();

    console.log(`[api] Received response ${response.status}:`, responseData);

    // The fetch API won't throw an error based on the response status, so we have to do
    // this manually.
    if (!response.ok) {
      const errorObject = { status: response.status, message: responseData.message };

      throw errorObject;
    }

    const responseHeaders = response.headers;

    // If the response has an Authorization header, this means that the token has
    // been refreshed.
    if (responseHeaders.has('Authorization')) {
      const bearer = responseHeaders.get('Authorization');
      // The header will begin with 'Bearer '; we don't need this
      const token = bearer.substr(7);

      console.log('[api] Refreshed token received. Storing new token');

      if (token) {
        store.dispatch(setLoggedIn(token));
      }
    }

    return responseData;
  } catch (error) {
    handleError(error, urlPath, throwGeneralError);

    return null;
  }
};

/**
 * Make a get request to the api.
 *
 * @async
 * @param {string} urlPath - The path of the endpoint e.g. /login
 * @param {any} body
 * @param {Object<string, string>} extraHeaders
 * @param {boolean} throwGeneralError - If false, any error thrown will be re-thrown.
 * @returns {Promise<any>} - The response body.
 */
export const makeGetRequest = async (
  urlPath,
  body = {},
  extraHeaders = {},
  throwGeneralError = true,
) => (
  makeRequest('GET', urlPath, body, extraHeaders, throwGeneralError)
);

/**
 * Make a post request to the api.
 *
 * @async
 * @param {string} urlPath - The path of the endpoint e.g. /login
 * @param {any} body
 * @param {Object<string, string>} extraHeaders
 * @param {boolean} throwGeneralError - If false, any error thrown will be re-thrown.
 * @returns {Promise<any>} - The response body.
 */
export const makePostRequest = async (
  urlPath,
  body = {},
  extraHeaders = {},
  throwGeneralError = true,
) => (
  makeRequest('POST', urlPath, body, extraHeaders, throwGeneralError)
);

/**
 * Handle any errors thrown by the request e.g. any non-200 responses.
 *
 * @param {Object} error
 * @param {number} error.status
 * @param {string} error.message
 * @param {string} urlPath
 * @param {boolean} throwGeneralError
 */
const handleError = (error, urlPath, throwGeneralError) => {
  const store = getStore();
  const loginFailure = error.status === 401 && urlPath === '/login';

  // If throwGeneralError is false and the resonse isn't unauthorised,
  // or if it is an unauthorised response from logging in (e.g. invalid credentials),
  // then re-throw the error to be caught by the caller.
  if ((!throwGeneralError && error.status !== 401) || loginFailure) {
    console.log('[api] Letting the action handle the error');

    throw error;
  }

  const { status } = error;

  if (status === 401) {
    console.log('[api] Response returned unauthorised. Logging out');

    store.dispatch(setGoBackAfterLogin(true));
    store.dispatch(logOut());

    return;
  }

  console.log('[api] Handling as a general error');

  showError(error.message);
};
