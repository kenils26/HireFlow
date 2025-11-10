import React, { useState } from 'react';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaFileAlt, FaCopy } from 'react-icons/fa';
import { generateTestQuestions } from '../../services/recruiterService';

const TestGenerator = () => {
  const [formData, setFormData] = useState({
    testType: 'aptitude',
    topic: 'quantitative aptitude',
    difficulty: 'medium',
    count: 5
  });
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: name === 'count' ? parseInt(value) || 5 : value
    };
    
    // Reset topic when switching to coding
    if (name === 'testType' && value === 'coding') {
      newFormData.topic = 'programming';
    } else if (name === 'testType' && value === 'aptitude' && formData.testType === 'coding') {
      newFormData.topic = 'quantitative aptitude';
    }
    
    setFormData(newFormData);
    setError('');
    setQuestions(null);
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError('');
      setQuestions(null);

      const response = await generateTestQuestions(formData);
      
      if (response.data.success) {
        setQuestions(response.data.data);
      } else {
        setError(response.data.message || 'Failed to generate test questions');
      }
    } catch (err) {
      console.error('Error generating test questions:', err);
      
      // Handle specific error messages
      let errorMessage = 'Failed to generate test questions. Please try again.';
      
      if (err.response?.data?.error) {
        const apiError = err.response.data.error;
        
        if (typeof apiError === 'string' && apiError.toLowerCase().includes('overloaded')) {
          errorMessage = 'The AI model is currently overloaded. Please wait a moment and try again.';
        } else if (typeof apiError === 'string' && apiError.toLowerCase().includes('quota')) {
          errorMessage = 'API quota exceeded. Please try again later.';
        } else if (typeof apiError === 'object' && apiError.message) {
          errorMessage = apiError.message;
        } else if (typeof apiError === 'string') {
          errorMessage = apiError;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handleReset = () => {
    setFormData({
      testType: 'aptitude',
      topic: 'quantitative aptitude',
      difficulty: 'medium',
      count: 5
    });
    setQuestions(null);
    setError('');
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Test Generator</h1>
          <p className="text-gray-600">
            Generate aptitude or coding test questions using AI
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Test Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Type
              </label>
              <select
                name="testType"
                value={formData.testType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="aptitude">Aptitude</option>
                <option value="coding">Coding</option>
                <option value="both">Both (Aptitude + Coding)</option>
              </select>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic {formData.testType === 'coding' && '(N/A for coding)'}
              </label>
              <input
                type="text"
                name="topic"
                value={formData.testType === 'coding' ? 'programming' : formData.topic}
                onChange={handleChange}
                placeholder={formData.testType === 'coding' ? 'Not applicable for coding questions' : 'e.g., quantitative aptitude, data structures'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={formData.testType === 'coding'}
              />
              {formData.testType === 'coding' && (
                <p className="text-xs text-gray-500 mt-1">Topic is automatically set for coding questions</p>
              )}
              {formData.testType === 'both' && (
                <p className="text-xs text-gray-500 mt-1">Topic applies to aptitude questions only</p>
              )}
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                name="count"
                value={formData.count}
                onChange={handleChange}
                min="1"
                max="20"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum 20 questions</p>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
              <FaTimesCircle />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-6 flex space-x-4">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Generating Questions...</span>
                </>
              ) : (
                <>
                  <FaFileAlt />
                  <span>Generate Questions</span>
                </>
              )}
            </button>
            {questions && (
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        {questions && questions.questions && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="text-green-500 text-2xl" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Generated {questions.count} Question{questions.count !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Type: {questions.testType} | Difficulty: {questions.difficulty}
                    {questions.topic && ` | Topic: ${questions.topic}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {questions.questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Q{index + 1}
                      </span>
                      {question.type && (
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                          {question.type}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleCopy(JSON.stringify(question, null, 2))}
                      className="text-gray-500 hover:text-gray-700 p-1"
                      title="Copy question"
                    >
                      <FaCopy className="text-sm" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-800 font-medium mb-3">{question.question}</p>
                    
                    <div className="space-y-2">
                      {question.options && Object.entries(question.options).map(([key, value]) => (
                        <div
                          key={key}
                          className={`p-3 rounded-lg border-2 ${
                            question.answer === key
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <span className={`font-semibold ${
                              question.answer === key ? 'text-green-700' : 'text-gray-700'
                            }`}>
                              {key}.
                            </span>
                            <span className={question.answer === key ? 'text-green-800' : 'text-gray-800'}>
                              {value}
                            </span>
                            {question.answer === key && (
                              <span className="ml-auto text-green-600 font-semibold text-sm">
                                ✓ Correct Answer
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestGenerator;

