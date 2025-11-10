import React, { useState, useEffect } from 'react';
import { FaUser, FaSave, FaSpinner, FaCheckCircle, FaTimesCircle, FaUpload, FaFilePdf } from 'react-icons/fa';
import { getCurrentUser } from '../../services/authService';
import { updateCandidateProfile, uploadResume } from '../../services/candidateService';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    location: '',
    preferredLanguage: 'English',
  });
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Hindi', 'Other'];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await getCurrentUser();
      if (response.success && response.data.user) {
        const user = response.data.user;
        setUserData(user);
        setFormData({
          fullName: user.candidateProfile?.fullName || '',
          contactNumber: user.candidateProfile?.contactNumber || '',
          location: user.candidateProfile?.location || '',
          preferredLanguage: user.candidateProfile?.preferredLanguage || 'English',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        return;
      }
      setResumeFile(file);
      setError('');
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setError('Please select a resume file');
      return;
    }

    try {
      setUploadingResume(true);
      setError('');
      const response = await uploadResume(resumeFile);
      if (response.data.success) {
        setSuccess('Resume uploaded successfully');
        setResumeFile(null);
        await loadProfile(); // Reload profile to get updated resume URL
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await updateCandidateProfile(formData);
      if (response.data.success) {
        setSuccess('Profile updated successfully');
        await loadProfile(); // Reload profile to get updated data
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="p-6 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Profile</h1>
          <p className="text-gray-600">Update your personal information and resume</p>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <FaUser className="w-8 h-8 text-primary" />
            <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
              <FaTimesCircle />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
              <FaCheckCircle />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={userData?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                required
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter city, country"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
              <select
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Resume Upload */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FaFilePdf className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-800">Resume</h2>
          </div>

          {userData?.candidateProfile?.resumeUrl && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Current Resume:</p>
              <a
                href={userData.candidateProfile.resumeUrl.startsWith('http') 
                  ? userData.candidateProfile.resumeUrl 
                  : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${userData.candidateProfile.resumeUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center space-x-2"
              >
                <FaFilePdf />
                <span>View Current Resume</span>
              </a>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Resume (PDF only)</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {resumeFile && (
                <p className="text-sm text-gray-600 mt-2">Selected: {resumeFile.name}</p>
              )}
            </div>

            <button
              onClick={handleResumeUpload}
              disabled={!resumeFile || uploadingResume}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {uploadingResume ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <FaUpload />
                  <span>Upload Resume</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

