const { Job, JobSkill, JobApplication, Recruiter, Candidate, User } = require('../models');
const { Op } = require('sequelize');

// Get all jobs for a recruiter
const getRecruiterJobs = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const { search, status, page = 1, limit = 10 } = req.query;

    const where = {
      recruiterId: recruiter.id
    };

    // Filter by status (active/closed)
    if (status && status !== 'All') {
      where.isActive = status === 'Active';
    }

    // Search by title or company name
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { companyName: { [Op.iLike]: `%${search}%` } }
      ];
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
          model: JobApplication,
          as: 'applications',
          attributes: ['id'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Get application counts for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await JobApplication.count({
          where: { jobId: job.id }
        });

        const jobData = job.toJSON();
        jobData.applicationCount = applicationCount;
        return jobData;
      })
    );

    res.json({
      success: true,
      data: {
        jobs: jobsWithCounts,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching recruiter jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
};

// Get single job by ID for recruiter
const getRecruiterJob = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const job = await Job.findOne({
      where: {
        id,
        recruiterId: recruiter.id
      },
      include: [
        {
          model: JobSkill,
          as: 'skills',
          attributes: ['id', 'skillName']
        }
      ]
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Get application count
    const applicationCount = await JobApplication.count({
      where: { jobId: job.id }
    });

    const jobData = job.toJSON();
    jobData.applicationCount = applicationCount;

    res.json({
      success: true,
      data: { job: jobData }
    });
  } catch (error) {
    console.error('Error fetching recruiter job:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message
    });
  }
};

// Create a new job
const createJob = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const {
      title,
      location,
      jobType,
      workMode,
      experienceLevel,
      salaryMin,
      salaryMax,
      salaryCurrency,
      description,
      requirements,
      benefits,
      skills,
      companyName,
      companyLogoUrl
    } = req.body;

    // Validate required fields
    if (!title || !location || !jobType || !workMode || !experienceLevel || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create job
    const job = await Job.create({
      recruiterId: recruiter.id,
      title,
      companyName: companyName || recruiter.companyName,
      companyLogoUrl: companyLogoUrl || recruiter.companyLogoUrl,
      location,
      jobType,
      workMode,
      experienceLevel,
      salaryMin: salaryMin ? parseFloat(salaryMin) : null,
      salaryMax: salaryMax ? parseFloat(salaryMax) : null,
      salaryCurrency: salaryCurrency || 'USD',
      description,
      requirements: requirements || null,
      benefits: benefits || null,
      isActive: true
    });

    // Add skills if provided
    if (skills && Array.isArray(skills) && skills.length > 0) {
      const skillPromises = skills.map((skillName) =>
        JobSkill.create({
          jobId: job.id,
          skillName: skillName.trim()
        })
      );
      await Promise.all(skillPromises);
    }

    // Fetch job with skills
    const jobWithSkills = await Job.findByPk(job.id, {
      include: [
        {
          model: JobSkill,
          as: 'skills',
          attributes: ['id', 'skillName']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job: jobWithSkills }
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job',
      error: error.message
    });
  }
};

// Update a job
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const job = await Job.findOne({
      where: {
        id,
        recruiterId: recruiter.id
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const {
      title,
      location,
      jobType,
      workMode,
      experienceLevel,
      salaryMin,
      salaryMax,
      salaryCurrency,
      description,
      requirements,
      benefits,
      skills,
      companyName,
      companyLogoUrl,
      isActive
    } = req.body;

    // Update job fields
    if (title) job.title = title;
    if (location) job.location = location;
    if (jobType) job.jobType = jobType;
    if (workMode) job.workMode = workMode;
    if (experienceLevel) job.experienceLevel = experienceLevel;
    if (salaryMin !== undefined) job.salaryMin = salaryMin ? parseFloat(salaryMin) : null;
    if (salaryMax !== undefined) job.salaryMax = salaryMax ? parseFloat(salaryMax) : null;
    if (salaryCurrency) job.salaryCurrency = salaryCurrency;
    if (description) job.description = description;
    if (requirements !== undefined) job.requirements = requirements;
    if (benefits !== undefined) job.benefits = benefits;
    if (companyName) job.companyName = companyName;
    if (companyLogoUrl !== undefined) job.companyLogoUrl = companyLogoUrl;
    if (isActive !== undefined) job.isActive = isActive;

    await job.save();

    // Update skills if provided
    if (skills && Array.isArray(skills)) {
      // Delete existing skills
      await JobSkill.destroy({ where: { jobId: job.id } });

      // Add new skills
      if (skills.length > 0) {
        const skillPromises = skills.map((skillName) =>
          JobSkill.create({
            jobId: job.id,
            skillName: skillName.trim()
          })
        );
        await Promise.all(skillPromises);
      }
    }

    // Fetch updated job with skills
    const updatedJob = await Job.findByPk(job.id, {
      include: [
        {
          model: JobSkill,
          as: 'skills',
          attributes: ['id', 'skillName']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job: updatedJob }
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job',
      error: error.message
    });
  }
};

// Delete a job
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const job = await Job.findOne({
      where: {
        id,
        recruiterId: recruiter.id
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Delete associated skills
    await JobSkill.destroy({ where: { jobId: job.id } });

    // Delete the job
    await job.destroy();

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: error.message
    });
  }
};

// Get applications for a specific job
const getJobApplications = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const job = await Job.findOne({
      where: {
        id,
        recruiterId: recruiter.id
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const applications = await JobApplication.findAll({
      where: { jobId: job.id },
      include: [
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
      order: [['appliedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

module.exports = {
  getRecruiterJobs,
  getRecruiterJob,
  createJob,
  updateJob,
  deleteJob,
  getJobApplications
};

