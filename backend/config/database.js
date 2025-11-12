const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from the backend directory
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Ensure password is always a string
// Check if password is undefined, null, or not a string
let dbPassword = '';
if (process.env.DB_PASSWORD !== undefined && process.env.DB_PASSWORD !== null) {
  dbPassword = String(process.env.DB_PASSWORD);
}

// Debug: Log if password is missing (only in development)
if (process.env.NODE_ENV === 'development' && !process.env.DB_PASSWORD) {
  console.warn('⚠️  Warning: DB_PASSWORD is not set in .env file. Using empty password.');
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'fig_hiring_platform',
  process.env.DB_USER || 'postgres',
  dbPassword,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error; // Re-throw to handle in sync
  }
};

module.exports = { sequelize, testConnection };

