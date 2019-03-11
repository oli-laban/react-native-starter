import Model from './Model';

export default class Version extends Model {
  /**
   * The database table name to use for the model.
   *
   * @type {string|null}
   */
  table = 'version';

  /**
   * The schema of the table.
   *
   * @type {Object[]}
   */
  schema = [
    { name: 'version', type: 'INTEGER' },
  ];

  /**
   * Get the latest stored version of the database.
   *
   * @async
   * @returns {Promise<number>}
   */
  async getLatest() {
    const [results] = await this.database.executeSql(
      `SELECT version FROM ${this.table} ORDER BY version DESC LIMIT 1;`,
    );

    if (results.rows && results.rows.length > 0) {
      return results.rows.item(0).version;
    }

    return 0;
  }
}
