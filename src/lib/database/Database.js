import SQLite from 'react-native-sqlite-storage';
import Initialisation from './Initialisation';
import { databaseConfig } from '../../config';

class Database {
  /**
   * The name of the database.
   *
   * @type {string}
   */
  databaseName = 'RNStarter.db';

  /**
   * The SQLite database.
   *
   * @type {SQLite.SQLiteDatabase|undefined}
   */
  database;

  /**
   * Open the database connection and initialise the database tables.
   *
   * @async
   * @returns {Promise<SQLite.SQLiteDatabase>}
   */
  async open() {
    SQLite.DEBUG(databaseConfig.debug);
    SQLite.enablePromise(true);

    const database = await SQLite.openDatabase({
      name: this.databaseName,
      location: 'default',
    });

    const databaseInstance = database;

    console.log('[db] Database open');

    const databaseInitialisation = new Initialisation();
    databaseInitialisation.updateTables(databaseInstance);

    this.database = databaseInstance;

    return databaseInstance;
  }

  /**
   * Close the database.
   *
   * @async
   * @returns {Promise<void>}
   */
  async close() {
    if (this.database === undefined) {
      throw new Error('[db] Database was not open; unable to close');
    }

    await this.database.close();

    console.log('[db] Database closed');

    this.database = undefined;
  }

  /**
   * Get the open database or open a new database connection.
   *
   * @async
   * @returns {Promise<SQLite.SQLiteDatabase>}
   */
  async getDatabase() {
    if (this.database !== undefined) {
      return Promise.resolve(this.database);
    }

    const database = await this.open();

    return database;
  }
}

export default new Database();
