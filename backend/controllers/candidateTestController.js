const { AptitudeTest, AptitudeQuestion, TestSubmission, JobApplication, Candidate, Job } = require('../models');
const { Op } = require('sequelize');

// Get test for a job (for candidate to take)
const getTestForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Get candidate
    const candidate = await Candidate.findOne({ where: { userId: req.user.id } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    // Check if candidate has applied for this job
    const application = await JobApplication.findOne({
      where: {
        jobId,
        candidateId: candidate.id
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'You must apply for this job first before taking the test'
      });
    }

    // Check if test already submitted
    const existingSubmission = await TestSubmission.findOne({
      where: {
        jobApplicationId: application.id,
        candidateId: candidate.id
      }
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already taken this test',
        data: { submission: existingSubmission }
      });
    }

    // Get test for this job
    const test = await AptitudeTest.findOne({
      where: { jobId },
      include: [
        {
          model: AptitudeQuestion,
          as: 'questions',
          attributes: ['id', 'question', 'options', 'category'],
          order: [['createdAt', 'ASC']],
          separate: true
        },
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName']
        }
      ]
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'No aptitude test available for this job'
      });
    }

    // Remove correct answers from response (candidates shouldn't see them)
    const testData = test.toJSON();
    testData.questions = testData.questions.map(q => {
      const { correctAnswer, ...questionWithoutAnswer } = q;
      return questionWithoutAnswer;
    });

    res.json({
      success: true,
      data: {
        test: testData,
        applicationId: application.id
      }
    });
  } catch (error) {
    console.error('Get test for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching test',
      error: error.message
    });
  }
};

// Submit test answers
const submitTest = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { answers, applicationId } = req.body;

    // Get candidate
    const candidate = await Candidate.findOne({ where: { userId: req.user.id } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    // Verify application
    const application = await JobApplication.findOne({
      where: {
        id: applicationId,
        jobId,
        candidateId: candidate.id
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Job application not found'
      });
    }

    // Check if already submitted
    const existingSubmission = await TestSubmission.findOne({
      where: {
        jobApplicationId: application.id,
        candidateId: candidate.id
      }
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Test already submitted'
      });
    }

    // Get test with questions
    const test = await AptitudeTest.findOne({
      where: { jobId },
      include: [
        {
          model: AptitudeQuestion,
          as: 'questions',
          attributes: ['id', 'correctAnswer'],
          order: [['createdAt', 'ASC']],
          separate: true
        }
      ]
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Calculate score
    let correctCount = 0;
    const totalQuestions = test.questions.length;

    test.questions.forEach(question => {
      const candidateAnswer = answers[question.id];
      if (candidateAnswer !== undefined && candidateAnswer === question.correctAnswer) {
        correctCount++;
      }
    });

    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const isPassed = test.passingPercentage !== null 
      ? score >= parseFloat(test.passingPercentage) 
      : null;

    // Create test submission
    const submission = await TestSubmission.create({
      testId: test.id,
      candidateId: candidate.id,
      jobApplicationId: application.id,
      answers,
      score: parseFloat(score.toFixed(2)),
      totalQuestions,
      correctAnswers: correctCount,
      isPassed,
      submittedAt: new Date()
    });

    // Update application status based on test result
    // Only candidates who pass will be visible to recruiters
    if (isPassed === true) {
      await application.update({ status: 'Under Review' });
    } else if (isPassed === false) {
      // Candidate failed - set to Rejected and they won't be visible to recruiter
      await application.update({ status: 'Rejected' });
    }

    res.json({
      success: true,
      message: 'Test submitted successfully',
      data: {
        submission: {
          id: submission.id,
          score: submission.score,
          correctAnswers: submission.correctAnswers,
          totalQuestions: submission.totalQuestions,
          isPassed: submission.isPassed,
          passingPercentage: test.passingPercentage
        }
      }
    });
  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting test',
      error: error.message
    });
  }
};

// Get test submission result
const getTestResult = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Get candidate
    const candidate = await Candidate.findOne({ where: { userId: req.user.id } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    // Get application
    const application = await JobApplication.findOne({
      where: {
        jobId,
        candidateId: candidate.id
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Job application not found'
      });
    }

    // Get submission
    const submission = await TestSubmission.findOne({
      where: {
        jobApplicationId: application.id,
        candidateId: candidate.id
      },
      include: [
        {
          model: AptitudeTest,
          as: 'test',
          attributes: ['id', 'title', 'passingPercentage']
        }
      ]
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Test submission not found'
      });
    }

    res.json({
      success: true,
      data: { submission }
    });
  } catch (error) {
    console.error('Get test result error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching test result',
      error: error.message
    });
  }
};

// Check if test is available for a job
const checkTestAvailability = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Get candidate
    const candidate = await Candidate.findOne({ where: { userId: req.user.id } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    // Check if candidate has applied
    const application = await JobApplication.findOne({
      where: {
        jobId,
        candidateId: candidate.id
      }
    });

    if (!application) {
      return res.json({
        success: true,
        data: {
          hasTest: false,
          hasApplied: false,
          message: 'You must apply for this job first'
        }
      });
    }

    // Check if test exists
    const test = await AptitudeTest.findOne({
      where: { jobId }
    });

    if (!test) {
      return res.json({
        success: true,
        data: {
          hasTest: false,
          hasApplied: true,
          message: 'No aptitude test available for this job'
        }
      });
    }

    // Check if already submitted
    const submission = await TestSubmission.findOne({
      where: {
        jobApplicationId: application.id,
        candidateId: candidate.id
      }
    });

    res.json({
      success: true,
      data: {
        hasTest: true,
        hasApplied: true,
        hasSubmitted: !!submission,
        testId: test.id,
        applicationId: application.id,
        submission: submission ? {
          id: submission.id,
          score: submission.score,
          isPassed: submission.isPassed,
          submittedAt: submission.submittedAt
        } : null
      }
    });
  } catch (error) {
    console.error('Check test availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking test availability',
      error: error.message
    });
  }
};

module.exports = {
  getTestForJob,
  submitTest,
  getTestResult,
  checkTestAvailability
};

