const express = require('express');
const router = express.Router();
const { requireCandidate } = require('../middleware/roleAuth');
const upload = require('../utils/upload');
const { 
  updateCandidateProfile,
  addEducation,
  getEducations,
  deleteEducation,
  addExperience,
  getExperiences,
  deleteExperience,
  addSkill,
  getSkills,
  deleteSkill,
  uploadResume,
  completeQuestionnaire,
  parseResume
} = require('../controllers/candidateController');
const {
  getApplications,
  getApplication,
  getApplicationStatus
} = require('../controllers/applicationController');
const {
  getSettings,
  updateSettings
} = require('../controllers/settingsController');

// All routes require candidate role
router.use(requireCandidate);

// Profile routes
router.put('/profile', updateCandidateProfile);
router.post('/resume', upload.single('resume'), uploadResume);
router.post('/parse-resume', upload.single('resume'), parseResume);
router.post('/complete-questionnaire', completeQuestionnaire);

// Education routes
router.post('/education', addEducation);
router.get('/education', getEducations);
router.delete('/education/:id', deleteEducation);

// Experience routes
router.post('/experience', addExperience);
router.get('/experience', getExperiences);
router.delete('/experience/:id', deleteExperience);

// Skill routes
router.post('/skill', addSkill);
router.get('/skill', getSkills);
router.delete('/skill/:id', deleteSkill);

// Application routes
router.get('/applications', getApplications);
router.get('/applications/:id', getApplication);
router.get('/applications/:id/status', getApplicationStatus);

// Interview routes
const {
  getCandidateInterviews,
  getCandidateInterview,
  requestReschedule
} = require('../controllers/candidateInterviewController');

router.get('/interviews', getCandidateInterviews);
router.get('/interviews/:id', getCandidateInterview);
router.post('/interviews/:id/reschedule', requestReschedule);

// Settings routes
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;

