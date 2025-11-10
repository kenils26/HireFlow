import React, { useState, useEffect } from 'react';
import { FaUser, FaBuilding, FaSave, FaSpinner, FaCheckCircle, FaTimesCircle, FaChevronDown } from 'react-icons/fa';
import { getCurrentUser } from '../../services/authService';
import { updateRecruiterProfile, updateCompanyInfo } from '../../services/recruiterService';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [personalFormData, setPersonalFormData] = useState({
    fullName: '',
    role: '',
    contactNumber: '',
    linkedinProfile: '',
  });
  const [companyFormData, setCompanyFormData] = useState({
    companyName: '',
    companyWebsite: '',
    industryType: '',
    companySize: '',
    headquartersLocation: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showCompanySizeDropdown, setShowCompanySizeDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'company'

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing',
    'Real Estate', 'Consulting', 'Media', 'Transportation', 'Energy', 'Other'
  ];

  const companySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

  useEffect(() => {
    loadProfile();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showIndustryDropdown && !event.target.closest('.industry-dropdown')) {
        setShowIndustryDropdown(false);
      }
      if (showCompanySizeDropdown && !event.target.closest('.company-size-dropdown')) {
        setShowCompanySizeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIndustryDropdown, showCompanySizeDropdown]);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await getCurrentUser();
      if (response.success && response.data.user) {
        const user = response.data.user;
        setUserData(user);
        setPersonalFormData({
          fullName: user.recruiterProfile?.fullName || '',
          role: user.recruiterProfile?.role || '',
          contactNumber: user.recruiterProfile?.contactNumber || '',
          linkedinProfile: user.recruiterProfile?.linkedinProfile || '',
        });
        setCompanyFormData({
          companyName: user.recruiterProfile?.companyName || '',
          companyWebsite: user.recruiterProfile?.companyWebsite || '',
          industryType: user.recruiterProfile?.industryType || '',
          companySize: user.recruiterProfile?.companySize || '',
          headquartersLocation: user.recruiterProfile?.headquartersLocation || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleIndustrySelect = (industry) => {
    setCompanyFormData(prev => ({ ...prev, industryType: industry }));
    setShowIndustryDropdown(false);
  };

  const handleCompanySizeSelect = (size) => {
    setCompanyFormData(prev => ({ ...prev, companySize: size }));
    setShowCompanySizeDropdown(false);
  };

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await updateRecruiterProfile(personalFormData);
      if (response.data.success) {
        setSuccess('Personal information updated successfully');
        await loadProfile();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating personal information');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await updateCompanyInfo(companyFormData);
      if (response.data.success) {
        setSuccess('Company information updated successfully');
        await loadProfile();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating company information');
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
          <p className="text-gray-600">Update your personal and company information</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'personal'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaUser className="inline-block mr-2" />
                Personal Information
              </button>
              <button
                onClick={() => setActiveTab('company')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'company'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaBuilding className="inline-block mr-2" />
                Company Information
              </button>
            </nav>
          </div>

          <div className="p-6">
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

            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <form onSubmit={handlePersonalSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={personalFormData.fullName}
                    onChange={handlePersonalChange}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <input
                    type="text"
                    name="role"
                    value={personalFormData.role}
                    onChange={handlePersonalChange}
                    placeholder="e.g., HR Manager, Talent Acquisition"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    required
                    value={personalFormData.contactNumber}
                    onChange={handlePersonalChange}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
                  <input
                    type="url"
                    name="linkedinProfile"
                    value={personalFormData.linkedinProfile}
                    onChange={handlePersonalChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
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
            )}

            {/* Company Information Tab */}
            {activeTab === 'company' && (
              <form onSubmit={handleCompanySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={companyFormData.companyName}
                    onChange={handleCompanyChange}
                    placeholder="Enter company name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Website</label>
                  <input
                    type="url"
                    name="companyWebsite"
                    required
                    value={companyFormData.companyWebsite}
                    onChange={handleCompanyChange}
                    placeholder="https://www.yourcompany.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="relative industry-dropdown">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry Type</label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      required
                      value={companyFormData.industryType}
                      onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
                      placeholder="Select industry"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    />
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                  {showIndustryDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {industries.map((industry) => (
                        <button
                          key={industry}
                          type="button"
                          onClick={() => handleIndustrySelect(industry)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {industry}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative company-size-dropdown">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      required
                      value={companyFormData.companySize}
                      onClick={() => setShowCompanySizeDropdown(!showCompanySizeDropdown)}
                      placeholder="Select company size"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    />
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                  {showCompanySizeDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      {companySizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleCompanySizeSelect(size)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Headquarters Location</label>
                  <input
                    type="text"
                    name="headquartersLocation"
                    required
                    value={companyFormData.headquartersLocation}
                    onChange={handleCompanyChange}
                    placeholder="City, Country"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

