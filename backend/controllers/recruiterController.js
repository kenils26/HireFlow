const { Recruiter, RecruiterExperience, RecruiterSkill, User } = require('../models');
const axios = require('axios');

// Update recruiter profile (Step 2)
const updateRecruiterProfile = async (req, res) => {
  try {
    const { fullName, role, contactNumber, linkedinProfile } = req.body;
    const userId = req.user.id;

    const recruiter = await Recruiter.findOne({ where: { userId } });
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    await recruiter.update({
      fullName,
      role,
      contactNumber,
      linkedinProfile
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { recruiter }
    });
  } catch (error) {
    console.error('Update recruiter profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Update company info (Step 1)
const updateCompanyInfo = async (req, res) => {
  try {
    const { companyName, companyWebsite, industryType, companySize, headquartersLocation } = req.body;
    const userId = req.user.id;

    const recruiter = await Recruiter.findOne({ where: { userId } });
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    await recruiter.update({
      companyName,
      companyWebsite,
      industryType,
      companySize,
      headquartersLocation
    });

    res.json({
      success: true,
      message: 'Company information updated successfully',
      data: { recruiter }
    });
  } catch (error) {
    console.error('Update company info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating company information',
      error: error.message
    });
  }
};

// Add experience (Step 3)
const addExperience = async (req, res) => {
  try {
    const { companyName, role, fromDate, toDate, isCurrent } = req.body;
    const userId = req.user.id;

    const recruiter = await Recruiter.findOne({ where: { userId } });
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const experience = await RecruiterExperience.create({
      recruiterId: recruiter.id,
      companyName,
      role,
      fromDate,
      toDate: isCurrent ? null : toDate,
      isCurrent: isCurrent || false
    });

    res.status(201).json({
      success: true,
      message: 'Experience added successfully',
      data: { experience }
    });
  } catch (error) {
    console.error('Add experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding experience',
      error: error.message
    });
  }
};

// Get all experiences
const getExperiences = async (req, res) => {
  try {
    const userId = req.user.id;
    const recruiter = await Recruiter.findOne({ where: { userId } });
    
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const experiences = await RecruiterExperience.findAll({ where: { recruiterId: recruiter.id } });

    res.json({
      success: true,
      data: { experiences }
    });
  } catch (error) {
    console.error('Get experiences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching experiences',
      error: error.message
    });
  }
};

// Delete experience
const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recruiter = await Recruiter.findOne({ where: { userId } });
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const experience = await RecruiterExperience.findOne({ where: { id, recruiterId: recruiter.id } });
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    await experience.destroy();

    res.json({
      success: true,
      message: 'Experience deleted successfully'
    });
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting experience',
      error: error.message
    });
  }
};

// Add skill
const addSkill = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const recruiter = await Recruiter.findOne({ where: { userId } });
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    // Check if skill already exists
    const existingSkill = await RecruiterSkill.findOne({ where: { recruiterId: recruiter.id, name } });
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill already exists'
      });
    }

    const skill = await RecruiterSkill.create({
      recruiterId: recruiter.id,
      name
    });

    res.status(201).json({
      success: true,
      message: 'Skill added successfully',
      data: { skill }
    });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding skill',
      error: error.message
    });
  }
};

// Get all skills
const getSkills = async (req, res) => {
  try {
    const userId = req.user.id;
    const recruiter = await Recruiter.findOne({ where: { userId } });
    
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const skills = await RecruiterSkill.findAll({ where: { recruiterId: recruiter.id } });

    res.json({
      success: true,
      data: { skills }
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching skills',
      error: error.message
    });
  }
};

// Delete skill
const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recruiter = await Recruiter.findOne({ where: { userId } });
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const skill = await RecruiterSkill.findOne({ where: { id, recruiterId: recruiter.id } });
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    await skill.destroy();

    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting skill',
      error: error.message
    });
  }
};

// Upload company documents (Step 4)
const uploadCompanyDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { domainEmail } = req.body;
    const recruiter = await Recruiter.findOne({ where: { userId } });
    
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const updateData = {};
    if (req.files?.companyLogo) {
      updateData.companyLogoUrl = `/uploads/company-logos/${req.files.companyLogo[0].filename}`;
    }
    if (req.files?.businessProof) {
      updateData.businessProofUrl = `/uploads/business-proofs/${req.files.businessProof[0].filename}`;
    }
    if (domainEmail) {
      updateData.domainEmail = domainEmail;
    }

    await recruiter.update(updateData);

    res.json({
      success: true,
      message: 'Company documents uploaded successfully',
      data: { recruiter }
    });
  } catch (error) {
    console.error('Upload company documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading company documents',
      error: error.message
    });
  }
};

// Complete questionnaire
const completeQuestionnaire = async (req, res) => {
  try {
    const userId = req.user.id;
    const recruiter = await Recruiter.findOne({ where: { userId } });
    
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    await recruiter.update({ questionnaireCompleted: true });

    res.json({
      success: true,
      message: 'Questionnaire completed successfully'
    });
  } catch (error) {
    console.error('Complete questionnaire error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing questionnaire',
      error: error.message
    });
  }
};

// Generate test questions (Aptitude/Coding/Both)
const generateTestQuestions = async (req, res) => {
  try {
    const { testType = 'aptitude', topic = 'quantitative aptitude', difficulty = 'medium', count = 5 } = req.body;

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.'
      });
    }

    // Model name - handle both formats
    let modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    if (modelName.startsWith('models/')) {
      modelName = modelName.replace('models/', '');
    }

    // Validate test type
    const validTestTypes = ['aptitude', 'coding', 'both'];
    if (!validTestTypes.includes(testType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test type. Must be "aptitude", "coding", or "both"'
      });
    }

    // Build prompt based on test type
    let prompt = '';
    
    if (testType.toLowerCase() === 'aptitude') {
      prompt = `Generate ${count} ${difficulty}-level aptitude test questions on ${topic}.

Each question must include:
- A question statement
- 4 options labeled A, B, C, D
- The correct answer

Format the response strictly as JSON in this structure:
[
  {
    "question": "string",
    "options": {"A": "string", "B": "string", "C": "string", "D": "string"},
    "answer": "A"
  }
]

Return only valid JSON array without any markdown formatting or code blocks.`;
    } else if (testType.toLowerCase() === 'coding') {
      prompt = `Generate ${count} ${difficulty}-level coding/programming test questions covering various programming concepts like algorithms, data structures, programming languages, problem-solving, and code analysis.

Each question must include:
- A problem statement or coding challenge
- 4 multiple choice options labeled A, B, C, D (can include code snippets, explanations, or output predictions)
- The correct answer

Questions can cover:
- Algorithm and data structure concepts
- Code output prediction
- Bug finding in code snippets
- Time/space complexity analysis
- Programming language syntax and features
- Problem-solving approaches

Format the response strictly as JSON in this structure:
[
  {
    "question": "string",
    "options": {"A": "string", "B": "string", "C": "string", "D": "string"},
    "answer": "A"
  }
]

Return only valid JSON array without any markdown formatting or code blocks.`;
    } else if (testType.toLowerCase() === 'both') {
      const aptitudeCount = Math.ceil(count / 2);
      const codingCount = Math.floor(count / 2);
      
      prompt = `Generate a mixed test with ${aptitudeCount} aptitude questions and ${codingCount} coding questions.

For aptitude questions (on ${topic}):
- A question statement
- 4 options labeled A, B, C, D
- The correct answer

For coding questions:
- A problem statement or coding challenge
- 4 options labeled A, B, C, D with code snippets or explanations
- The correct answer

Format the response strictly as JSON in this structure:
[
  {
    "question": "string",
    "type": "aptitude" or "coding",
    "options": {"A": "string", "B": "string", "C": "string", "D": "string"},
    "answer": "A"
  }
]

Return only valid JSON array without any markdown formatting or code blocks.`;
    }

    // Call Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log('Generating test questions with type:', testType);
    console.log('Topic:', topic, 'Difficulty:', difficulty, 'Count:', count);

    const response = await axios.post(
      apiUrl,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000 // 60 second timeout
      }
    );

    // Extract the response content
    const geminiResponse = response.data;
    let questions = [];
    
    if (geminiResponse.candidates && geminiResponse.candidates.length > 0) {
      const candidate = geminiResponse.candidates[0];
      
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const content = candidate.content.parts[0].text;
        console.log('Generated content length:', content ? content.length : 0);
        
        if (content) {
          try {
            // Remove markdown code blocks if present
            let cleanContent = content.trim();
            if (cleanContent.startsWith('```json')) {
              cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (cleanContent.startsWith('```')) {
              cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            
            // Try to parse JSON array
            const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              questions = JSON.parse(jsonMatch[0]);
            } else {
              // Try to parse the whole content
              questions = JSON.parse(cleanContent);
            }
            
            // Validate questions structure
            if (!Array.isArray(questions)) {
              questions = [];
            }
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Content:', content.substring(0, 500));
            return res.status(500).json({
              success: false,
              message: 'Failed to parse generated questions',
              error: 'Invalid JSON response from AI model'
            });
          }
        }
      }
    }

    if (questions.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'No questions generated',
        error: 'Failed to generate test questions'
      });
    }

    res.json({
      success: true,
      message: 'Test questions generated successfully',
      data: {
        questions,
        testType,
        topic,
        difficulty,
        count: questions.length
      }
    });
  } catch (error) {
    console.error('Generate test questions error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // Handle specific Gemini API errors
    let errorMessage = 'Failed to generate test questions';
    let statusCode = 500;
    
    if (error.response) {
      const apiError = error.response.data;
      statusCode = error.response.status;
      
      if (apiError.error) {
        const geminiError = apiError.error;
        if (typeof geminiError === 'object') {
          errorMessage = geminiError.message || geminiError.status || 'Gemini API error';
          
          if (geminiError.message && (
            geminiError.message.toLowerCase().includes('overloaded') ||
            geminiError.message.toLowerCase().includes('quota') ||
            geminiError.status === 'RESOURCE_EXHAUSTED'
          )) {
            statusCode = 503;
            errorMessage = 'The AI model is currently overloaded. Please wait a moment and try again.';
          }
        } else if (typeof geminiError === 'string') {
          errorMessage = geminiError;
          if (geminiError.toLowerCase().includes('overloaded') || 
              geminiError.toLowerCase().includes('quota')) {
            statusCode = 503;
            errorMessage = 'The AI model is currently overloaded. Please wait a moment and try again.';
          }
        }
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(statusCode).json({
      success: false,
      message: 'Failed to generate test questions',
      error: errorMessage
    });
  }
};

module.exports = {
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
};

