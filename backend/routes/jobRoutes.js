const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireCandidate } = require('../middleware/roleAuth');

// Public routes (with optional authentication)
router.get('/', optionalAuth, jobController.getJobs);
router.get('/:id', optionalAuth, jobController.getJobById);

// Candidate-only routes
router.post('/:id/apply', authenticate, requireCandidate, jobController.applyForJob);
router.post('/:id/save', authenticate, requireCandidate, jobController.toggleSaveJob);
router.get('/saved/all', authenticate, requireCandidate, jobController.getSavedJobs);

module.exports = router;

