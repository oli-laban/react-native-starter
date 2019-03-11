import * as types from './types';

/**
 * @typedef {Object} databaseState
 * @property {boolean} isReady - Indicates whether the SQLite database is ready.
 */

/**
 * The initial state for the database module.
 *
 * @type {databaseState}
 */
const initialState = {
  isReady: false,
};

/**
 * The reducer for the database module.
 *
 * @param {databaseState} state
 * @param {Object} action
 * @returns {databaseState}
 */
export default (state = initialState, action) => {
  switch (action.type) {
    case types.SET_DATABASE_READY:
      return { ...state, isReady: true };
    default:
      return state;
  }
};
