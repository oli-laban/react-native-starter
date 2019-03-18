import { showError } from 'lib/errors';

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
   * @param {SQLite.SQLiteDatabase} database - The open database instance.
   */
  constructor(database) {
    this.database = database;
  }

  /**
   * Get the schema of the table with the id column added.
   *
   * @returns {Object[]} The schema of the table.
   */
  getSchema = () => {
    const { schema } = this;

    if (!schema) {
      throw new Error('[db] Schema not set on child class');
    }

    return [{ name: 'id', type: 'INTEGER PRIMARY KEY NOT NULL' }, ...schema];
  }

  /**
   * Check that a column exists within the table's schema.
   *
   * @param {string} columnName - The name of the column to look for.
   * @return {boolean} Whether the column exists.
   */
  columnExists(columnName) {
    const schema = this.getSchema();

    return !!schema.find(column => column.name === columnName);
  }

  /**
   * Create the database table for the model. A transaction must be passed as this should only
   * be called on initialisation of the database.
   *
   * @param {SQLite.Transaction} transaction - The transaction to perform the query on.
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
   * Drop the table for the model. A transaction must be passed as this should only be
   * called on initialisation of the database.
   *
   * @param {SQLite.Transaction} transaction - The transaction to perform the query on.
   */
  dropTable(transaction) {
    const { table } = this;

    if (!table) {
      throw new Error('[db] Table not set on child class');
    }

    transaction.executeSql(`DROP TABLE IF EXISTS ${table};`);
  }

  /**
   * @typedef {Object} whereClause - An object representing the where clause for a column.
   * @property {string} operator - The operator to create the clause with.
   * @property {any} value - The value of the column.
   */

  /**
   * @typedef {Object} transformedClause - An object containing the WHERE clause string and values.
   * @property {string} clause - The WHERE clause string.
   * @property {any[]} clauseValues - The values to pass to executeSql().
   */

  /**
   * Transform an ID or a "where" object into a where clause.
   *
   * - If a single number is passed, it will be treated as a value of the id column.
   * - Otherwise, an object can be passed e.g:
   *   {
   *     name: 'foo',
   *     user_id: { operator: '!=', value: 3 },
   *   }
   *   ...which would be transformed into "WHERE name = 'foo' AND user_id != 3"
   *
   * @param {number|Object<string, any|whereClause>} idOrWhere - ID of the row or a where object.
   * @returns {transformedClause} An object containing the WHERE clause string and values.
   */
  transformIdOrWhere(idOrWhere = null) {
    let clause = '';
    let clauseValues = [];

    if (!idOrWhere) return { clause, clauseValues };

    if (typeof idOrWhere === 'object') {
      clause = Object.keys(idOrWhere)
        .map((column, index) => {
          const prefix = index === 0 ? 'WHERE' : 'AND';
          const value = idOrWhere[column];

          if (typeof value === 'object') {
            clauseValues.push(value.value);

            // In case an object was passed with only the value property.
            const operator = value.operator || '=';

            return `${prefix} ${column} ${operator} ?`;
          }

          clauseValues.push(value);

          return `${prefix} ${column} = ?`;
        })
        .join(' ');
    } else if (idOrWhere) {
      clause = ' WHERE id = ?';
      clauseValues = [idOrWhere];
    }

    return { clause, clauseValues };
  }

  /**
   * @typedef {Object} queryOptions - The additional query clauses.
   * @property {string|string[]} [options.groupBy] - A column / array to group the query by.
   * @property {string} [options.orderBy] - A column to order the query by.
   * @property {string} [options.order] - Either "ASC" or "DESC". Defaults to "ASC" if omitted.
   * @property {number} [options.limit] - A number to limit the amount of returned rows.
   * @property {numer} [options.offset] - A number to offset the returned rows.
   */

  /**
   * @typedef {Object} transformedOptions - An object containing the extra clauses for the query.
   * @property {string} suffix - The query string for the extra clauses.
   * @property {any[]} suffixValues - The values to pass to executeSql().
   */

  /**
   * Transform the options object into a string of additional clauses for the query.
   *
   * @param {queryOptions} options - The additional query clauses.
   * @returns {transformedOptions} - An object containing the extra clauses and values.
   */
  transformOptions(options = {}) {
    let suffix = '';
    const suffixValues = [];

    if (options.groupBy) {
      // Using ? for GROUP BY in a prepared statement doesn't work in SQLite, so we'll need
      // to validate the column(s) and include directly in the query string.
      if (Array.isArray(options.groupBy)) {
        const groupByColumns = options.groupBy
          .filter(column => this.columnExists(column))
          .join(', ');

        suffix += ` GROUP BY ${groupByColumns}`;
      } else if (this.columnExists(options.groupBy)) {
        suffix += ` GROUP BY ${options.groupBy}`;
      }
    }

    if (options.orderBy) {
      let order = 'DESC';

      if (options.order) {
        order = options.order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      }

      // As with GROUP BY, Using ? for ORDER BY in a prepared statement doesn't work in SQLite.
      if (this.columnExists(options.orderBy)) {
        suffix += ` ORDER BY ${options.orderBy} ${order}`;
      }
    }

    if (options.limit) {
      suffix += ' LIMIT ?';
      suffixValues.push(options.limit);
    }

    if (options.offset) {
      suffix += ' OFFSET ?';
      suffixValues.push(options.offset);
    }

    return { suffix, suffixValues };
  }

  /**
   * Insert a new row into the table.
   *
   * @async
   * @param {Object<string, any>} data - Values to insert, where the keys are the column names.
   * @returns {Promise<number>} The ID of the inserted row.
   */
  async create(data) {
    const { table, database } = this;

    const keys = Object.keys(data);
    const values = Object.values(data);

    const query = `
      INSERT INTO ${table} (
        ${keys.join(', ')}
      ) VALUES (
        ${keys.map(() => '?').join(', ')}
      );
    `;

    try {
      const [results] = await database.executeSql(query, values);
      const { insertId } = results;

      console.log(`[db] Created ${table} row with insertId: ${insertId}`);

      return insertId;
    } catch (error) {
      console.log(`[db] Unable to create ${table} row. Details: `, error);

      showError(`Something went wrong inserting into ${table}.`);

      return null;
    }
  }

  /**
   * Delete a row from the table.
   *
   * @param {number|Object<string, any|whereClause>} idOrWhere - ID of the row or a where object.
   * @param {queryOptions} options - The additional query clauses.
   * @returns {Promise<number>} The ID of the removed row.
   */
  async delete(idOrWhere, options = {}) {
    const { table, database } = this;
    const { clause, clauseValues } = this.transformIdOrWhere(idOrWhere);
    const { suffix, suffixValues } = this.transformOptions(options);
    const values = [...clauseValues, ...suffixValues];

    try {
      const query = `DELETE FROM ${table} ${clause}${suffix}`;
      const [results] = await database.executeSql(query, values);
      const { insertId } = results;

      console.log(`[db] Deleted ${table} row with id: ${insertId}`);

      return insertId;
    } catch (error) {
      console.log(`[db] Unable to delete ${table} row. Details: `, error);

      showError(`Something went wrong deleting from ${table}.`);

      return null;
    }
  }

  /**
   * Fetch rows from the table, specifying the returned columns.
   *
   * @param {string[]} columns - An array of columns to select in the query.
   * @param {number|Object<string, any|whereClause>} idOrWhere - ID of the row or a where object.
   * @param {queryOptions} options - The additional query clauses.
   * @returns {Object[]} The returned rows.
   */
  async getColumns(columns, idOrWhere = null, options = {}) {
    const { table, database } = this;
    const { clause, clauseValues } = this.transformIdOrWhere(idOrWhere);
    const { suffix, suffixValues } = this.transformOptions(options);
    const values = [...clauseValues, ...suffixValues];
    const select = columns.join(', ');

    try {
      const query = `SELECT ${select} from ${table} ${clause}${suffix}`;
      const [results] = await database.executeSql(query, values);
      const rows = [];

      if (results !== 'undefined') {
        for (let i = 0; i < results.rows.length; i++) {
          const row = results.rows.item(i);

          rows.push(row);
        }
      }

      console.log(`[db] Fetched row(s) from ${table}: `, rows);

      return rows;
    } catch (error) {
      console.log(`[db] Unable to fetch row(s) from ${table}. Details: `, error);

      showError(`Something went wrong fetching from ${table}.`);

      return [];
    }
  }

  /**
   * Fetch rows from the table.
   *
   * @param {number|Object<string, any|whereClause>} idOrWhere - ID of the row or a where object.
   * @param {queryOptions} options - The additional query clauses.
   * @returns {Object[]} The returned rows.
   */
  async get(idOrWhere = null, options = {}) {
    const rows = await this.getColumns(['*'], idOrWhere, options);

    return rows;
  }

  /**
   * Fetch a single row from the table.
   *
   * @param {number|Object<string, any|whereClause>} idOrWhere - ID of the row or a where object.
   * @param {queryOptions} options - The additional query clauses.
   * @returns {Object<any, any>} The returned row.
   */
  async getOne(idOrWhere = null, options = {}) {
    const optionsWithLimit = { ...options, limit: 1 };
    const rows = await this.get(idOrWhere, optionsWithLimit);

    if (rows.length) return rows[0];

    return null;
  }
}
