import { AsyncStorage } from 'react-native';
import { showError } from '../errors';

/**
 * Save a value to local storage.
 *
 * @async
 * @param {string} key
 * @param {any} value
 * @param {boolean} isObject
 * @returns {Promise<void>}
*/
export const saveToStorage = async (key, value, isObject = false) => {
  console.log(`[storage] Saving ${key} to storage: `, value);

  try {
    let valueToSave = value;

    if (isObject) valueToSave = JSON.stringify(valueToSave);

    await AsyncStorage.setItem(key, valueToSave);
  } catch (error) {
    console.log('[storage] Error saving to storage: ', error);

    showError('Something went wrong saving to storage.');
  }
};

/**
 * Retreive a value from local storage.
 *
 * @async
 * @param {string} key
 * @param {boolean} isObject
 * @returns {Promise<any>}
*/
export const getFromStorage = async (key, isObject = false) => {
  console.log(`[storage] Retreiving ${key} from storage`);

  try {
    const value = await AsyncStorage.getItem(key);

    if (isObject) return JSON.parse(value);

    return value;
  } catch (error) {
    console.log('[storage] Error retreiving from storage: ', error);

    showError('Something went wrong retreiving from storage.');

    return null;
  }
};

/**
 * Remove a value from local storage.
 *
 * @async
 * @param {string} key
 * @returns {Promise<void>}
*/
export const removeFromStorage = async (key) => {
  console.log(`[storage] Removing ${key} from storage`);

  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.log('[storage] Error removing from storage: ', error);

    showError('Something went wrong removing from storage.');
  }
};
