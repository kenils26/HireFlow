import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaChevronRight } from 'react-icons/fa';
import { getApplications } from '../../services/applicationService';
import Loading from '../../components/Loading';

const Applications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const response = await getApplications();
        if (response.data && response.data.success) {
          setApplications(response.data.data || []);
        } else {
          console.error('Unexpected response format:', response);
        }
      } catch (error) {
        console.error('Error loading applications:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
        }
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, [location.pathname]); // Reload when pathname changes

  const getStatusColor = (status) => {
    switch (status) {
      case 'Interview':
        return 'bg-green-100 text-green-800';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800';
      case 'Test Scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'Offer':
        return 'bg-purple-100 text-purple-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Interview':
        return 'Interview Scheduled';
      case 'Test Scheduled':
        return 'Test Scheduled';
      case 'Offer':
        return 'Offer Received';
      default:
        return status;
    }
  };

  const getNextStep = (status) => {
    switch (status) {
      case 'Applied':
        return 'Waiting for response';
      case 'Under Review':
        return 'Waiting for response';
      case 'Test Scheduled':
        return 'Coding Test';
      case 'Interview':
        return 'Technical Interview';
      case 'Offer':
        return 'Pending decision';
      case 'Rejected':
        return 'Application rejected';
      default:
        return 'Waiting for response';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleApplicationClick = (applicationId) => {
    navigate(`/applications/${applicationId}`);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Applications</h1>
        <p className="text-gray-600 text-sm">Track all your job applications</p>
      </div>

      {/* Apply Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => navigate('/browse-jobs')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
        >
          + Apply to Jobs
        </button>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">No applications yet</p>
          <button
            onClick={() => navigate('/browse-jobs')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              onClick={() => handleApplicationClick(application.id)}
              className="bg-white rounded-lg shadow p-5 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Job Title and Status */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {application.job?.title || 'Job Title'}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {getStatusLabel(application.status)}
                    </span>
                  </div>

                  {/* Company Name */}
                  <p className="text-gray-600 text-sm mb-4">
                    {application.job?.companyName || 'Company Name'}
                  </p>

                  {/* Application Date and Next Step */}
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="w-4 h-4" />
                      <span>Applied {formatDate(application.appliedAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaClock className="w-4 h-4" />
                      <span>{getNextStep(application.status)}</span>
                    </div>
                  </div>
                </div>

                {/* Arrow Icon */}
                <div className="ml-4">
                  <FaChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;

