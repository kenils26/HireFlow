require('dotenv').config();
const { syncDatabase } = require('../models');
const seedJobs = require('./seedJobs');

const runSeed = async () => {
  try {
    console.log('Connecting to database...');
    await syncDatabase(false);
    
    console.log('Starting seed process...');
    await seedJobs();
    
    console.log('Seed process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed process failed:', error);
    process.exit(1);
  }
};

runSeed();

