const { sequelize, testConnection } = require('../config/database');

// Import all models
const User = require('./User');
const Candidate = require('./Candidate');
const Recruiter = require('./Recruiter');
const Education = require('./Education');
const Experience = require('./Experience');
const Skill = require('./Skill');
const RecruiterExperience = require('./RecruiterExperience');
const RecruiterSkill = require('./RecruiterSkill');
const Job = require('./Job');
const JobSkill = require('./JobSkill');
const JobApplication = require('./JobApplication');
const SavedJob = require('./SavedJob');
const Interview = require('./Interview');
const Settings = require('./Settings');

// Sync database
const syncDatabase = async (force = false) => {
  try {
    await testConnection();
    // Use alter: true to automatically add new columns to existing tables
    // In production, use migrations instead
    await sequelize.sync({ force, alter: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error; // Re-throw to handle in server startup
  }
};

module.exports = {
  sequelize,
  User,
  Candidate,
  Recruiter,
  Education,
  Experience,
  Skill,
  RecruiterExperience,
  RecruiterSkill,
  Job,
  JobSkill,
  JobApplication,
  SavedJob,
  Interview,
  Settings,
  syncDatabase
};

