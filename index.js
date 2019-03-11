import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import createStore from 'store';
import { registerStore } from 'store/registry';
import App from './src/App';
import { name as appName } from './app.json';

/**
 * The application's redux store.
 *
 * @type {Function}
 */
export const store = createStore();

// Register the store with the registry to make it available globally.
registerStore(store);

AppRegistry.registerComponent(appName, () => () => (
  <Provider store={store}>
    <App />
  </Provider>
));
