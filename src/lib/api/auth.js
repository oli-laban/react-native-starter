import { makePostRequest, makeGetRequest } from './api';

/**
 * The api routes related to auth.
 *
 * @type {Object<string, string>}
 */
const routes = {
  LOGIN: '/login',
  TEST: '/user',
};

/**
 * @typedef {Object} loginResponse
 * @property {string} token
 * @property {Object} user
 * @property {number} user.id
 * @property {string} user.name
 * @property {string} user.email
*/

/**
 * Make a post request to log the user into the application.
 *
 * @async
 * @param {Object} body
 * @param {string} body.email
 * @param {string} body.password
 * @returns {Promise<loginResponse>}
 */
export const logIn = async body => makePostRequest(routes.LOGIN, body);

/**
 * Test request to a route protected by JWT.
 *
 * @async
 * @returns {Promise<any>}
 */
export const test = async () => makeGetRequest(routes.TEST);
