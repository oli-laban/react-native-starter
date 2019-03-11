/**
 * The application's redux store. Used to prevent having to fetch the store from
 * the app entrypoint, causing circular dependencies.
 *
 * @type {Object}
 */
let store;

/**
 * Set the redux store. This should be the same store that is passed to the redux Provider.
 *
 * @param {Object} newStore
 */
export const registerStore = (newStore) => {
  store = newStore;
};

/**
 * Get the redux store.
 *
 * @returns {Object}
 */
export const getStore = () => store;
