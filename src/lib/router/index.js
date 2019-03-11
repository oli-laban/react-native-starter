import { createStackNavigator } from 'react-navigation';
import Login from 'components/Login';
import Products from 'components/Products';

/**
 * Create the root navigator of the application. Set the initial route based on
 * whether the user is logged in or not.
 *
 * @param {boolean} loggedIn
 * @returns {React.ComponentClass}
 */
export const createRootNavigator = (loggedIn = false) => {
  const initialRoute = loggedIn ? 'Products' : 'Login';

  console.log(`[nav] Creating root navigator with initial page: ${initialRoute}`);

  return createStackNavigator({
    Login: {
      screen: Login,
    },
    Products: {
      screen: Products,
    },
  }, {
    initialRouteName: initialRoute,
  });
};
