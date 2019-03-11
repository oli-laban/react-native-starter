import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import database from './modules/database';
import auth from './modules/auth';

/**
 * Apply middleware to a new redux store.
 *
 * @type {Function}
 */
const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);

/**
 * Combine the reducer modules.
 *
 * @type {Function}
 */
const reducer = combineReducers({
  database,
  auth,
});

/**
 * Create the store using the combined modules.
 *
 * @param {any} initialState
 * @returns {Function}
 */
export default (initialState) => {
  console.log('[store] Create redux store');

  return createStoreWithMiddleware(reducer, initialState);
};
