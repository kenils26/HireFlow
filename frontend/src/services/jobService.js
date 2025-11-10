import api from '../utils/api';

// Get all jobs with filters
export const getJobs = async (params = {}) => {
  try {
    const response = await api.get('/jobs', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get job by ID
export const getJobById = async (id) => {
  try {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Apply for a job
export const applyForJob = async (jobId, coverLetter = null) => {
  try {
    const response = await api.post(`/jobs/${jobId}/apply`, { coverLetter });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Save/Unsave a job
export const toggleSaveJob = async (jobId) => {
  try {
    const response = await api.post(`/jobs/${jobId}/save`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get saved jobs
export const getSavedJobs = async () => {
  try {
    const response = await api.get('/jobs/saved/all');
    return response.data;
  } catch (error) {
    throw error;
  }
};

