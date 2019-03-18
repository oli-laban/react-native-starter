# React Native Starter

A React Native starter template with Redux, JWT authentication and SQLite.

## Getting Started

* Run `npm install` or `yarn` to install the necessary packages
* Rename the app if you wish to do so (outlined below)
* Copy `env-axample` into `.env` and `.env-production`
* Start the bundler with `react-native start`
* Run the app on a simulator with `react-native run-ios` or `react-native run-android`
* For production releases, refer to the [React Native docs](https://facebook.github.io/react-native/docs/getting-started).

### Renaming the app

1. Change the name in `package.json`
2. Run `react-native upgrade`
3. Run `react-native link`
4. Follow the instructions to link [react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage) manually as the automatic link probably won't work
5. Change the SQLite database name in `src/lib/database/Database.js`

## Environment Config

An environment config is set up with [react-native-dotenv](https://github.com/zetachang/react-native-dotenv) which currently has some limitations:

* No additional environments can be set up. Only `.env` (dev) and `.env.production`
* Variables **must** exist inside the `.env` files, even if they are optional.
* **Variables are loaded with babel, which the bundler caches. You will need to run `raect-native start --reset-cache` each time the `.env` files are updated.**

The only required variable at the moment is `API_BASE_URL`.

Environment variables are mapped into the general config inside `src/config/index.js`.

## Authentication

JWT authentication is set up to work with Laravel and [jwt-auth](https://github.com/tymondesigns/jwt-auth) so will probably need modifying for any other authentication provider. This may include adding a middleware to refresh tokens, as refreshing is handled by Laravel and jwt-auth on the server.

*Example Laravel setup coming soon.*

## SQLite

SQLite is set up using [react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage).

### Models

Tables are added and configured using models inside `src/lib/database/models/`. Refer to the `Version.js` model on how to structure these.

The only required properties are `table`, which is the name of the database table, and `schema`, which is an object representing the structure of the table:

```
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
```

> **NOTE: The `id` column should be left out of the schema as this is added automatically.**

Methods to perform queries currently have to be added to models individually. *Some basic methods will be added to the base Model class soon.*

### Usage

```
import ProductsModel from 'lib/database/models/Products';
import database from 'lib/database/Database';
...
const db = await database.getDatabase();
const model = new ProductsModel(db);
const products = await model.getAll();
```

### Removing SQLite

1. Remove `src/lib/database/`
2. Remove `src/store/modules/database/` and the reducer from `src/store/index.js`
3. Remove any references to the database from `App.js` including the `AppState` listener and associated method
4. Remove the `databaseConfig` from `src/config/index.js`
5. Run `react-native unlink react-native-sqlite-storage`
6. Run `npm uninstall react-native-sqlite-storage` or `yarn remove react-native-sqlite-storage`

## Extras

* [redux](https://github.com/reduxjs/redux) and [redux-thunk](https://github.com/reduxjs/redux-thunk)
* [react-navigation](https://github.com/react-navigation/react-navigation)
* [react-native-splash-screen](https://github.com/crazycodeboy/react-native-splash-screen)
* [react-native-flash-message](https://github.com/lucasferreira/react-native-flash-message) for displaying errors
* [eslint-config-airbnb](https://github.com/airbnb/javascript)
* [babel-plugin-module-resolver](https://github.com/tleunen/babel-plugin-module-resolver) with aliases for `lib`, `store` and `components`

## License

The MIT License (MIT)

