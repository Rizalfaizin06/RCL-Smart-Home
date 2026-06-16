require('dotenv').config();

const requiredEnvVars = ['DB_USERNAME', 'DB_NAME', 'DB_HOST', 'DB_DIALECT'];

const missing = requiredEnvVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `Missing required database environment variables: ${missing.join(', ')}`
  );
}

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT,
  },
  test: {
    username: process.env.DB_USERNAME_TEST,
    password: process.env.DB_PASSWORD_TEST || null,
    database: process.env.DB_NAME_TEST || process.env.DB_NAME,
    host: process.env.DB_HOST_TEST,
    port: process.env.DB_PORT_TEST || 3306,
    dialect: process.env.DB_DIALECT_TEST,
  },
  production: {
    username: process.env.DB_USERNAME_PROD,
    password: process.env.DB_PASSWORD_PROD || null,
    database: process.env.DB_NAME_PROD || process.env.DB_NAME,
    host: process.env.DB_HOST_PROD,
    port: process.env.DB_PORT_PROD || 3306,
    dialect: process.env.DB_DIALECT_PROD,
  },
};
