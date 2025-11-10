const express = require('express');
const router = express.Router();
const { requireRecruiter } = require('../middleware/roleAuth');
const upload = require('../utils/upload');
const {
  updateRecruiterProfile,
  updateCompanyInfo,
  addExperience,
  getExperiences,
  deleteExperience,
  addSkill,
  getSkills,
  deleteSkill,
  uploadCompanyDocuments,
  completeQuestionnaire,
  generateTestQuestions
} = require('../controllers/recruiterController');
const {
  getRecruiterJobs,
  getRecruiterJob,
  createJob,
  updateJob,
  deleteJob,
  getJobApplications
} = require('../controllers/recruiterJobController');
const {
  getRecruiterApplications,
  getRecruiterApplication,
  updateApplicationStatus
} = require('../controllers/recruiterApplicationController');
const {
  getRecruiterInterviews,
  getRecruiterInterview,
  createInterview,
  updateInterview,
  deleteInterview,
  getJobCandidates
} = require('../controllers/recruiterInterviewController');
const {
  getSettings,
  updateSettings
} = require('../controllers/settingsController');

// All routes require recruiter role
router.use(requireRecruiter);

// Profile routes
router.put('/profile', updateRecruiterProfile);
router.put('/company', updateCompanyInfo);
router.post('/documents', upload.fields([
  { name: 'companyLogo', maxCount: 1 },
  { name: 'businessProof', maxCount: 1 }
]), uploadCompanyDocuments);
router.post('/complete-questionnaire', completeQuestionnaire);

// Experience routes
router.post('/experience', addExperience);
router.get('/experience', getExperiences);
router.delete('/experience/:id', deleteExperience);

// Skill routes
router.post('/skill', addSkill);
router.get('/skill', getSkills);
router.delete('/skill/:id', deleteSkill);

// Job routes
router.get('/jobs', getRecruiterJobs);
router.get('/jobs/:id', getRecruiterJob);
router.post('/jobs', createJob);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);
router.get('/jobs/:id/applications', getJobApplications);

// Application routes
router.get('/applications', getRecruiterApplications);
router.get('/applications/:id', getRecruiterApplication);
router.put('/applications/:id/status', updateApplicationStatus);

// Interview routes
router.get('/interviews', getRecruiterInterviews);
router.get('/interviews/:id', getRecruiterInterview);
router.post('/interviews', createInterview);
router.put('/interviews/:id', updateInterview);
router.delete('/interviews/:id', deleteInterview);
router.get('/jobs/:jobId/candidates', getJobCandidates);

// Test generator routes
router.post('/generate-test', generateTestQuestions);

// Settings routes
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;

