const { Job, JobSkill, JobApplication, SavedJob, Candidate, Recruiter } = require('../models');
const { Op } = require('sequelize');

// Get all jobs with filters and search
const getJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      experienceLevel,
      jobType,
      workMode,
      page = 1,
      limit = 12
    } = req.query;

    const where = {
      isActive: true
    };

    // Search by title, company, or skills
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { companyName: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (location && location !== 'All locations') {
      where.location = { [Op.iLike]: `%${location}%` };
    }

    if (experienceLevel && experienceLevel !== 'All experience levels') {
      where.experienceLevel = { [Op.iLike]: `%${experienceLevel}%` };
    }

    if (jobType && jobType !== 'All job types') {
      where.jobType = jobType;
    }

    if (workMode && workMode !== 'All work modes') {
      where.workMode = workMode;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: jobs } = await Job.findAndCountAll({
      where,
      include: [
        {
          model: JobSkill,
          as: 'skills',
          attributes: ['id', 'skillName']
        },
        {
          model: Recruiter,
          as: 'recruiter',
          attributes: ['id', 'companyName', 'companyLogoUrl']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Get candidate's saved jobs and applications if authenticated
    let savedJobIds = [];
    let appliedJobIds = [];

    if (req.user && req.user.role === 'candidate') {
      const candidate = await Candidate.findOne({ where: { userId: req.user.id } });
      if (candidate) {
        const savedJobs = await SavedJob.findAll({
          where: { candidateId: candidate.id },
          attributes: ['jobId']
        });
        savedJobIds = savedJobs.map(sj => sj.jobId);

        const applications = await JobApplication.findAll({
          where: { candidateId: candidate.id },
          attributes: ['jobId']
        });
        appliedJobIds = applications.map(app => app.jobId);
      }
    }

    const jobsWithStatus = jobs.map(job => {
      const jobData = job.toJSON();
      jobData.isSaved = savedJobIds.includes(job.id);
      jobData.isApplied = appliedJobIds.includes(job.id);
      return jobData;
    });

    res.json({
      success: true,
      data: {
        jobs: jobsWithStatus,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
};

// Get single job by ID
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id, {
      include: [
        {
          model: JobSkill,
          as: 'skills',
          attributes: ['id', 'skillName']
        },
        {
          model: Recruiter,
          as: 'recruiter',
          attributes: ['id', 'companyName', 'companyLogoUrl', 'companyWebsite', 'industryType', 'companySize', 'headquartersLocation']
        }
      ]
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Get candidate's saved and applied status if authenticated
    let isSaved = false;
    let isApplied = false;
    let application = null;

    if (req.user && req.user.role === 'candidate') {
      const candidate = await Candidate.findOne({ where: { userId: req.user.id } });
      if (candidate) {
        const savedJob = await SavedJob.findOne({
          where: { candidateId: candidate.id, jobId: id }
        });
        isSaved = !!savedJob;

        application = await JobApplication.findOne({
          where: { candidateId: candidate.id, jobId: id }
        });
        isApplied = !!application;
      }
    }

    const jobData = job.toJSON();
    jobData.isSaved = isSaved;
    jobData.isApplied = isApplied;
    if (application) {
      jobData.application = {
        id: application.id,
        status: application.status,
        appliedAt: application.appliedAt
      };
    }

    res.json({
      success: true,
      data: { job: jobData }
    });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message
    });
  }
};

// Apply for a job
const applyForJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { coverLetter } = req.body;

    if (req.user.role !== 'candidate') {
      return res.status(403).json({
        success: false,
        message: 'Only candidates can apply for jobs'
      });
    }

    const candidate = await Candidate.findOne({ where: { userId: req.user.id } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const job = await Job.findByPk(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (!job.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer active'
      });
    }

    // Check if already applied
    const existingApplication = await JobApplication.findOne({
      where: { candidateId: candidate.id, jobId: id }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application
    const application = await JobApplication.create({
      jobId: id,
      candidateId: candidate.id,
      coverLetter: coverLetter || null,
      status: 'Applied'
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error applying for job',
      error: error.message
    });
  }
};

// Save/Unsave a job
const toggleSaveJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'candidate') {
      return res.status(403).json({
        success: false,
        message: 'Only candidates can save jobs'
      });
    }

    const candidate = await Candidate.findOne({ where: { userId: req.user.id } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const job = await Job.findByPk(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if already saved
    const savedJob = await SavedJob.findOne({
      where: { candidateId: candidate.id, jobId: id }
    });

    if (savedJob) {
      // Unsave
      await savedJob.destroy();
      res.json({
        success: true,
        message: 'Job unsaved successfully',
        data: { isSaved: false }
      });
    } else {
      // Save
      await SavedJob.create({
        candidateId: candidate.id,
        jobId: id
      });
      res.json({
        success: true,
        message: 'Job saved successfully',
        data: { isSaved: true }
      });
    }
  } catch (error) {
    console.error('Toggle save job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving/unsaving job',
      error: error.message
    });
  }
};

// Get saved jobs for candidate
const getSavedJobs = async (req, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({
        success: false,
        message: 'Only candidates can view saved jobs'
      });
    }

    const candidate = await Candidate.findOne({ where: { userId: req.user.id } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const savedJobs = await SavedJob.findAll({
      where: { candidateId: candidate.id },
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            {
              model: JobSkill,
              as: 'skills',
              attributes: ['id', 'skillName']
            },
            {
              model: Recruiter,
              as: 'recruiter',
              attributes: ['id', 'companyName', 'companyLogoUrl']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const jobs = savedJobs.map(sj => {
      const jobData = sj.job.toJSON();
      jobData.isSaved = true;
      return jobData;
    });

    res.json({
      success: true,
      data: { jobs }
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved jobs',
      error: error.message
    });
  }
};

module.exports = {
  getJobs,
  getJobById,
  applyForJob,
  toggleSaveJob,
  getSavedJobs
};

