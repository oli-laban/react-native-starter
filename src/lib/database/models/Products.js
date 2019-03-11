import Model from './Model';

export default class Products extends Model {
  /**
   * The database table name to use for the model.
   *
   * @type {string|null}
   */
  table = 'products';

  /**
   * The schema of the table.
   *
   * @type {Object[]}
   */
  schema = [
    { name: 'product_id', type: 'INTEGER NOT NULL' },
    { name: 'name', type: 'TEXT NOT NULL' },
  ];

  /**
   * Create a new product in the database.
   *
   * @async
   * @param {number} product_id
   * @param {*} name
   * @returns {Promise<void>}
   */
  async create(product_id, name) {
    const [results] = await this.database.executeSql(
      `INSERT INTO ${this.table} (product_id, name) VALUES (?, ?);`,
      [product_id, name],
    );

    const { insertId } = results;

    console.log(`[db] Created product (${name}) with insertId: ${insertId}`);
  }

  /**
   * Get all products from the database.
   *
   * @async
   * @returns {Promise<Object[]>}
   */
  async getAll() {
    console.log('[db] Getting all products');

    const [results] = await this.database.executeSql(`SELECT * FROM ${this.table};`);

    if (results === undefined) return [];

    const products = [];

    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      const { product_id, name } = row;

      products.push({ product_id, name });
    }

    return products;
  }
}
