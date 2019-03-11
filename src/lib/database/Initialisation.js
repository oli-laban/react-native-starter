import VersionModel from './models/Version';
import ProductsModel from './models/Products';
import { databaseConfig } from '../../config';

export default class Initialisation {
  /**
   * Update the database tables, creating the tables first if necessary.
   *
   * @async
   * @param {SQLite.SQLiteDatabase} database
   * @returns {Promise<void>}
   */
  async updateTables(database) {
    let databaseVersion = 0;

    console.log('[db] Beginning database updates');

    await database.transaction(this.createTables);

    databaseVersion = await this.getVersion(database);

    console.log(`[db] Current database version is: ${databaseVersion}`);

    // Example of updating the schema once the app is released.
    // if (version < 1) await database.transaction(this.exampleUpdateVersion0);
    // if (version < 2) await database.transaction(...);
  }

  /**
   * Create the database tables, dropping them first if necessary.
   *
   * @param {SQLite.Transaction} transaction
   */
  createTables(transaction) {
    const tables = [
      new VersionModel(),
      new ProductsModel(),
    ];

    if (databaseConfig.dropTables) {
      tables.forEach(model => model.dropTable(transaction));
    }

    tables.forEach(model => model.createTable(transaction));
  }

  /**
   * Get the current database version.
   *
   * @async
   * @param {SQLite.SQLiteDatabase} database
   * @returns {Promise<number>}
   */
  async getVersion(database) {
    try {
      const version = await new VersionModel(database).getLatest();

      return version;
    } catch (error) {
      console.log(`[db] No version set; returning 0. Details: ${error}`);

      return 0;
    }
  }

  /**
   * An example of updating the database schema after the app is released.
   *
   * @param {SQLite.Transaction} transaction
   */
  exampleUpdateVersion0(transaction) {
    console.log('[db] Running pre-version 1 updates');

    transaction.executeSql('ALTER TABLE ...');

    transaction.executeSql('INSERT INTO version (version) values (1)');
  }
}
