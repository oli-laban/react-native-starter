import { API_BASE_URL, SQLITE_DEBUG_MODE, SQLITE_DROP_TABLES } from 'react-native-dotenv';

/**
 * Application settings that must be set in .env.
 *
 * @type {Object<string, string>}
*/
const requiredSettings = {
  API_BASE_URL: API_BASE_URL, // eslint-disable-line object-shorthand
};

// Throw an error if any of the required settings are not in the .env.
console.log('[config] Checking required .env variables are set: ', requiredSettings);

Object.keys(requiredSettings).forEach((setting) => {
  if (!requiredSettings[setting]) throw new Error(`${setting} is not set in .env`);
});

/**
 * The api config.
 *
 * @type {Object}
 */
export const apiConfig = {
  url: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
};

/**
 * The database config.
 *
 * @type {Object}
 */
export const databaseConfig = {
  debug: SQLITE_DEBUG_MODE === 'true' || false,
  dropTables: SQLITE_DROP_TABLES === 'true' || false,
};
