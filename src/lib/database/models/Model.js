export default class Model {
  /**
   * The database table name to use for the model.
   *
   * @type {string|null}
   */
  table = null;

  /**
   * The schema of the table.
   *
   * @type {Object[]}
   */
  schema = [];

  /**
   * The database instance on which to execute queries.
   *
   * @type {SQLite.SQLiteDatabase}
   */
  database;

  /**
   * Initialise the Model class.
   *
   * @param {SQLite.SQLiteDatabase} database
   */
  constructor(database) {
    this.database = database;
  }

  /**
   * Get the schema of the database with the id column added.
   *
   * @returns {Object[]}
   */
  getSchema = () => {
    const { schema } = this;

    if (!schema) {
      throw new Error('[db] Schema not set on child class');
    }

    return [{ name: 'id', type: 'INTEGER PRIMARY KEY NOT NULL' }, ...schema];
  }

  /**
   * Create the database table for the model.
   *
   * @param {SQLite.Transaction} transaction
   */
  createTable(transaction) {
    const { table, getSchema } = this;
    const schema = getSchema();

    if (!table) {
      throw new Error('[db] Table not set on child class');
    }

    const query = `
      CREATE TABLE IF NOT EXISTS ${table}(
        ${schema.map(column => `${column.name} ${column.type}`).join(', ')}
      );
    `;

    transaction.executeSql(query);
  }

  /**
   * Drop the table for the model.
   *
   * @param {SQLite.Transaction} transaction
   */
  dropTable(transaction) {
    const { table } = this;

    if (!table) {
      throw new Error('[db] Table not set on child class');
    }

    transaction.executeSql(`DROP TABLE IF EXISTS ${table};`);
  }
}
