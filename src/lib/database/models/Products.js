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
}
