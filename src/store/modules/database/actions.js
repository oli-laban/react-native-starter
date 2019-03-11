import * as types from './types';

/**
 * @typedef {Object} action
 * @property {string} type
 * @property {any} [payload]
 */

/**
 * Action creator for setting if the SQLite database is ready.
 *
 * @returns {action}
 */
export const setDatabaseReady = () => ({ type: types.SET_DATABASE_READY });
