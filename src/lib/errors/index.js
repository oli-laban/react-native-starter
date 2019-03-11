import { showMessage, hideMessage } from 'react-native-flash-message';

/**
 * Display an error message using react-native-flash-message.
 *
 * @param {string} message
 */
export const showError = message => (
  showMessage({
    message,
    type: 'danger',
  })
);

/**
 * Hide the currently displayed error message.
 */
export const hideError = () => hideMessage();
