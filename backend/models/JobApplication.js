const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Job = require('./Job');
const Candidate = require('./Candidate');

const JobApplication = sequelize.define('JobApplication', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Job,
      key: 'id'
    }
  },
  candidateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Candidate,
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('Applied', 'Under Review', 'Interview', 'Offer', 'Rejected'),
    defaultValue: 'Applied'
  },
  coverLetter: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'job_applications',
  timestamps: true
});

// Define associations
Job.hasMany(JobApplication, { foreignKey: 'jobId', as: 'applications' });
JobApplication.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

Candidate.hasMany(JobApplication, { foreignKey: 'candidateId', as: 'jobApplications' });
JobApplication.belongsTo(Candidate, { foreignKey: 'candidateId', as: 'candidate' });

module.exports = JobApplication;

