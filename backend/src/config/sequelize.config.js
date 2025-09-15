require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'health_app',
    password: process.env.DB_PASSWORD || 'secure_password_123',
    database: process.env.DB_NAME || 'health_declarations',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log,
  },
  test: {
    username: process.env.DB_USERNAME || 'health_app',
    password: process.env.DB_PASSWORD || 'secure_password_123',
    database: process.env.DB_NAME || 'health_declarations_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  },
  production: {
    username: process.env.DB_USERNAME || 'health_app',
    password: process.env.DB_PASSWORD || 'secure_password_123',
    database: process.env.DB_NAME || 'health_declarations',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  },
}; 