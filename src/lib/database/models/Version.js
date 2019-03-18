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
    const row = await this.getOne(null, { orderBy: 'version', order: 'DESC' });

    return row ? row.version : 0;
  }
}
