'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// 1. UPDATE: Load the config from the .cjs file instead of .json
const config = require(path.join(__dirname, '/../config/config.cjs'))[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // Uses the credentials loaded from the .env file via config.cjs
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      // 2. UPDATE: Check for both '.js' AND '.cjs' extensions
      (file.slice(-3) === '.js' || file.slice(-4) === '.cjs') &&
      file.indexOf('.test') === -1
    );
  })
  .forEach(file => {
    // The model definition function is exported from each model file
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// This is where associations are applied (calling the associate function in each model)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;