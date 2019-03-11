import { NavigationActions } from 'react-navigation';

/**
 * A ref to the application's navigator. This makes navigating simple outside of
 * React components.
 *
 * @type {React.ComponentClass}
 */
let navigator;

/**
 * Set the application's top level navigator.
 *
 * @param {React.ComponentClass} ref
 * @returns {React.ComponentClass}
 */
export const setTopLevelNavigator = (ref) => {
  navigator = ref;
};

/**
 * Use the navigator ref to dispatch a navigation action.
 *
 * @param {string} routeName
 * @param {Object} params
 */
export const navigate = (routeName, params = {}) => {
  navigator.dispatch(
    NavigationActions.navigate({ routeName, params }),
  );
};

/**
 * Use the navigator ref to go back to the previous screen.
 */
export const navigateBack = () => {
  navigator.dispatch(NavigationActions.back());
};
