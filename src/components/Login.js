import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Text, TextInput, Button } from 'react-native';
import { logIn as logInAction } from 'store/modules/auth/actions';

class LogIn extends Component {
  static navigationOptions = {
    header: null,
    gesturesEnabled: false,
  };

  state = {
    email: '',
    emailError: '',
    password: '',
    passwordError: '',
  };

  validate() {
    const { email, password } = this.state;

    let emailError = '';
    let passwordError = '';

    if (!email) emailError = 'Please enter your email address';

    if (!password) passwordError = 'Please enter your password';

    this.setState({ emailError, passwordError });

    return !!emailError || !!passwordError;
  }

  submit = () => {
    const { email, password } = this.state;

    const error = this.validate();

    if (!error) {
      const { logIn } = this.props;

      logIn(email, password);
    }
  }

  render() {
    const {
      email,
      emailError,
      password,
      passwordError,
    } = this.state;
    const { auth } = this.props;

    return (
      <>
        <Text style={{ color: 'red' }}>{auth.loginError}</Text>
        <TextInput
          style={{ height: 40 }}
          onChangeText={text => this.setState({ email: text })}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          autoFocus
          placeholder="Email"
          textContentType="username"
          value={email}
        />
        {emailError ? <Text style={{ color: 'red' }}>{emailError}</Text> : null}
        <TextInput
          style={{ height: 40 }}
          onChangeText={text => this.setState({ password: text })}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          placeholder="Password"
          textContentType="password"
          value={password}
        />
        {passwordError ? <Text style={{ color: 'red' }}>{passwordError}</Text> : null}
        <Button
          title={auth.loggingIn ? 'Logging In...' : 'Log In'}
          onPress={this.submit}
        />
      </>
    );
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
  auth: state.auth,
});

/**
 * Map the action creators to an object whose properties will be passed to the
 * component as props.
 *
 * @param {Function} dispatch
 * @returns {Function}
 */
const mapDispatchToProps = dispatch => ({
  logIn: (email, password) => dispatch(logInAction(email, password)),
});

/**
 * Export the component connected to the redux store.
 *
 * @type {Function}
 */
export default connect(mapStateToProps, mapDispatchToProps)(LogIn);
