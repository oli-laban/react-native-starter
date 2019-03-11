import React, { Component } from 'react';
import { AppState, View } from 'react-native';
import { connect } from 'react-redux';
import 'react-native-gesture-handler';
import { createAppContainer } from 'react-navigation';
import FlashMessage from 'react-native-flash-message';
import SplashScreen from 'react-native-splash-screen';
import database from 'lib/database/Database';
import { setDatabaseReady as setDatabaseReadyAction } from 'store/modules/database/actions';
import { checkAuthStatus as checkAuthStatusAction } from 'store/modules/auth/actions';
import { createRootNavigator } from 'lib/router';
import { setTopLevelNavigator } from 'lib/router/navigationService';

/**
 * The navigation element. Initialised in App.componentDidMount() once the
 * app has determined whether the user is logged in or not.
 *
 * @type {React.ComponentClass}
 */
let Navigator;

class App extends Component {
  /**
   * The component's state.
   *
   * @type {Object}
   */
  state = {
    appState: AppState.currentState, /** @type {string} */
    navigationInitialised: false, /** @type {boolean} */
  };

  /**
   * Open the database, initialise the navigator, remove the splash screen and register event
   * listeners. Called immediately before the first render.
   */
  async componentDidMount() {
    await this.openDatabase();

    const { checkAuthStatus } = this.props;

    const loggedIn = await checkAuthStatus();

    // Initialise the navigation using the logged in state.
    const topLevelNavigator = createRootNavigator(!!loggedIn);
    Navigator = createAppContainer(topLevelNavigator);

    this.setState({ appState: 'active', navigationInitialised: true }, () => {
      SplashScreen.hide();
    });

    AppState.addEventListener('change', this.onAppStateChange);
  }

  /**
   * Remove the registered event listeners. Called immediately before the component
   * is destroyed.
   */
  componentWillUnmount() {
    AppState.removeEventListener('change', this.onAppStateChange);
  }

  /**
   * Handle the app being moved from the background to foreground and vice versa.
   *
   * @param {string} nextAppState
   */
  onAppStateChange = (nextAppState) => {
    const { appState } = this.state;

    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      // App has moved into the foreground.
      console.log('[app] App is running in the foreground');

      this.openDatabase();
    } else if (nextAppState.match(/inactive|background/) && appState === 'active') {
      // App has moved into the background or become inactive.
      console.log('[app] App is inactive or running in the background');

      this.closeDatabase();
    }

    this.setState({ appState: nextAppState });
  }

  /**
   * Open the database.
   *
   * @async
   * @returns {Promise<void>}
   */
  async openDatabase() {
    await database.open();

    const { setDatabaseReady } = this.props;

    setDatabaseReady();
  }

  /**
   * Close the database.
   */
  closeDatabase() {
    database.close();
  }

  /**
   * Render the component.
   *
   * @returns {React.ReactNode}
   */
  render() {
    const { databaseReady } = this.props;
    const { navigationInitialised } = this.state;

    // Only render the component once the database and initial route are ready.
    if (databaseReady && navigationInitialised) {
      return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <Navigator ref={el => setTopLevelNavigator(el)} />
          <FlashMessage icon="auto" position="top" />
        </View>
      );
    }

    return null;
  }
}

/**
 * Map the necessary application state to an object whose properties will be
 * passed to the component as props.
 *
 * @param {Object} state
 * @returns {Function}
 */
const mapStateToProps = state => ({
  databaseReady: state.database.isReady,
});

/**
 * Map the action creators to an object whose properties will be passed to the
 * component as props.
 *
 * @param {Function} dispatch
 * @returns {Function}
 */
const mapDispatchToProps = dispatch => ({
  setDatabaseReady: () => dispatch(setDatabaseReadyAction()),
  checkAuthStatus: () => dispatch(checkAuthStatusAction()),
});

/**
 * Export the component connected to the redux store.
 *
 * @type {Function}
 */
export default connect(mapStateToProps, mapDispatchToProps)(App);
