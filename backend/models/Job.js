const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Recruiter = require('./Recruiter');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  recruiterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Recruiter,
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  companyLogoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  jobType: {
    type: DataTypes.ENUM('Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'),
    allowNull: false,
    defaultValue: 'Full-time'
  },
  workMode: {
    type: DataTypes.ENUM('Remote', 'Hybrid', 'On-site'),
    allowNull: false,
    defaultValue: 'On-site'
  },
  experienceLevel: {
    type: DataTypes.STRING,
    allowNull: false
  },
  salaryMin: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  salaryMax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  salaryCurrency: {
    type: DataTypes.STRING,
    defaultValue: 'USD'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  benefits: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  applicationDeadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  testDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  testStartTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  testEndTime: {
    type: DataTypes.TIME,
    allowNull: true
  }
}, {
  tableName: 'jobs',
  timestamps: true
});

// Define associations
Recruiter.hasMany(Job, { foreignKey: 'recruiterId', as: 'jobs' });
Job.belongsTo(Recruiter, { foreignKey: 'recruiterId', as: 'recruiter' });

module.exports = Job;

