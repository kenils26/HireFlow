const { JobApplication, Job, Candidate, Recruiter, User, Education, Experience, Skill } = require('../models');
const { Op } = require('sequelize');

// Get all applications for recruiter's jobs
const getRecruiterApplications = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const { search, status, jobId, page = 1, limit = 10 } = req.query;

    // Get all jobs for this recruiter
    const recruiterJobs = await Job.findAll({
      where: { recruiterId: recruiter.id },
      attributes: ['id']
    });
    const jobIds = recruiterJobs.map(job => job.id);

    if (jobIds.length === 0) {
      return res.json({
        success: true,
        data: {
          applications: [],
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: 0
        }
      });
    }

    const where = {
      jobId: { [Op.in]: jobIds }
    };

    // Filter by status
    if (status && status !== 'All') {
      where.status = status;
    } else {
    }

    // Filter by job
    if (jobId) {
      where.jobId = jobId;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: applications } = await JobApplication.findAndCountAll({
      where,
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName']
        },
        {
          model: Candidate,
          as: 'candidate',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ],
          attributes: ['id', 'fullName', 'contactNumber', 'location', 'resumeUrl']
        }
      ],
      order: [['appliedAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    // Filter by search (candidate name, job title, or email) if provided
    let filteredApplications = applications;
    let filteredCount = count;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredApplications = applications.filter(app => {
        const candidateName = app.candidate?.fullName?.toLowerCase() || '';
        const jobTitle = app.job?.title?.toLowerCase() || '';
        const candidateEmail = app.candidate?.user?.email?.toLowerCase() || '';
        return candidateName.includes(searchLower) || 
               jobTitle.includes(searchLower) || 
               candidateEmail.includes(searchLower);
      });
      filteredCount = filteredApplications.length;
    }

    res.json({
      success: true,
      data: {
        applications: filteredApplications,
        total: filteredCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(filteredCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching recruiter applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// Get single application by ID
const getRecruiterApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    // Get all jobs for this recruiter
    const recruiterJobs = await Job.findAll({
      where: { recruiterId: recruiter.id },
      attributes: ['id']
    });
    const jobIds = recruiterJobs.map(job => job.id);

    const application = await JobApplication.findOne({
      where: {
        id,
        jobId: { [Op.in]: jobIds }
      },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName', 'location', 'jobType', 'workMode']
        },
        {
          model: Candidate,
          as: 'candidate',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ]
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Get candidate's full profile
    const candidate = await Candidate.findByPk(application.candidateId, {
      include: [
        {
          model: Education,
          as: 'educations',
          attributes: ['id', 'degree', 'institution', 'yearOfCompletion']
        },
        {
          model: Experience,
          as: 'experiences',
          attributes: ['id', 'companyName', 'role', 'fromDate', 'toDate', 'isCurrent']
        },
        {
          model: Skill,
          as: 'skills',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        application,
        candidate
      }
    });
  } catch (error) {
    console.error('Error fetching recruiter application:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['Applied', 'Under Review', 'Interview', 'Offer', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    // Get all jobs for this recruiter
    const recruiterJobs = await Job.findAll({
      where: { recruiterId: recruiter.id },
      attributes: ['id']
    });
    const jobIds = recruiterJobs.map(job => job.id);

    const application = await JobApplication.findOne({
      where: {
        id,
        jobId: { [Op.in]: jobIds }
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.update({ status });

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message
    });
  }
};

module.exports = {
  getRecruiterApplications,
  getRecruiterApplication,
  updateApplicationStatus
};

