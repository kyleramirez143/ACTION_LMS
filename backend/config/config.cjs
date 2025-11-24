require('dotenv').config();

const config = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'aws123', // fallback to string
    database: process.env.DB_NAME || 'lmsdb',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
  },
};

module.exports = config;