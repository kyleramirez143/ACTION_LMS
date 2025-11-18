// config/config.cjs (Note the .cjs extension)

// Load environment variables immediately using CJS require
require('dotenv').config();

const getPassword = () => {
  const password = process.env.DB_PASSWORD;
  if (password === undefined) {
    console.warn("DB_PASSWORD environment variable is missing.");
    return null; 
  }
  return password;
};

const config = {
  development: {
    username: process.env.DB_USER,
    password: getPassword(), 
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
  },
  // ... other environments
};

// Use CJS export
module.exports = config;