import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FaSearch,
  FaCalendarAlt,
  FaUser,
  FaBriefcase,
  FaTimes as FaTimesIcon,
  FaChevronRight
} from 'react-icons/fa';
import { getRecruiterApplications } from '../../services/recruiterApplicationService';
import { getRecruiterJobs } from '../../services/recruiterJobService';
import Loading from '../../components/Loading';

const Applications = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [jobFilter, setJobFilter] = useState(searchParams.get('jobId') || 'All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    loadApplications();
  }, [currentPage, statusFilter, jobFilter]);

  const loadJobs = async () => {
    try {
      const response = await getRecruiterJobs({ page: 1, limit: 100 });
      if (response.data && response.data.success) {
        setJobs(response.data.data.jobs || []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(statusFilter !== 'All' && { status: statusFilter }),
        ...(jobFilter !== 'All' && { jobId: jobFilter }),
        ...(searchQuery && { search: searchQuery })
      };
      const response = await getRecruiterApplications(params);
      if (response.data && response.data.success) {
        setApplications(response.data.data.applications || []);
        setTotalPages(response.data.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (applicationId) => {
    navigate(`/recruiter/applications/${applicationId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied':
        return 'bg-yellow-100 text-yellow-800';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800';
      case 'Test Scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'Interview':
        return 'bg-green-100 text-green-800';
      case 'Offer':
        return 'bg-emerald-100 text-emerald-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Applied':
        return 'Pending';
      case 'Under Review':
        return 'Under Review';
      case 'Test Scheduled':
        return 'Test Scheduled';
      case 'Interview':
        return 'Interview Scheduled';
      case 'Offer':
        return 'Accepted';
      case 'Rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadApplications();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  if (loading && applications.length === 0) {
    return <Loading />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Applications</h1>
        <p className="text-gray-600 text-sm">View and manage all job applications</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by candidate name, job title, or email..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimesIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="All">All Status</option>
              <option value="Applied">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Test Scheduled">Test Scheduled</option>
              <option value="Interview">Interview Scheduled</option>
              <option value="Offer">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select
              value={jobFilter}
              onChange={(e) => {
                setJobFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="All">All Jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-gray-600 text-lg">No applications found</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.id}
                onClick={() => handleViewApplication(application.id)}
                className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {application.candidate?.fullName || 'Unknown Candidate'}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {getStatusLabel(application.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">
                      Applied for: <span className="font-medium">{application.job?.title}</span>
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-400" />
                        Applied on {formatDate(application.appliedAt)}
                      </div>
                      <div className="flex items-center">
                        <FaUser className="w-4 h-4 mr-2 text-gray-400" />
                        {application.candidate?.user?.email || 'N/A'}
                      </div>
                      {application.candidate?.location && (
                        <div className="flex items-center">
                          <FaBriefcase className="w-4 h-4 mr-2 text-gray-400" />
                          {application.candidate.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Arrow Icon */}
                <div className="flex justify-end mt-4">
                  <FaChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Applications;

