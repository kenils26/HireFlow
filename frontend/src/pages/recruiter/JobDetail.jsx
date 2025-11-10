import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaEye,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaDollarSign,
  FaUsers,
  FaBuilding
} from 'react-icons/fa';
import { getRecruiterJob, deleteJob } from '../../services/recruiterJobService';
import JobModal from '../../components/recruiter/JobModal';
import Loading from '../../components/Loading';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showJobModal, setShowJobModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const response = await getRecruiterJob(id);
      if (response.data && response.data.success) {
        setJob(response.data.data.job);
      }
    } catch (error) {
      console.error('Error loading job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowJobModal(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await deleteJob(id);
      if (response.data && response.data.success) {
        navigate('/recruiter/jobs');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert(error.response?.data?.message || 'Error deleting job');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewApplications = () => {
    navigate(`/recruiter/applications?jobId=${id}`);
  };

  const handleJobSaved = () => {
    setShowJobModal(false);
    loadJob();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatSalary = (min, max, currency = 'USD') => {
    if (!min && !max) return 'Not specified';
    const formatNumber = (num) => {
      return new Intl.NumberFormat('en-US').format(num);
    };
    if (min && max) {
      return `${currency} ${formatNumber(min)} - ${formatNumber(max)}`;
    }
    return min ? `${currency} ${formatNumber(min)}+` : `Up to ${currency} ${formatNumber(max)}`;
  };

  if (loading) {
    return <Loading />;
  }

  if (!job) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-600 text-lg mb-4">Job not found</p>
          <button
            onClick={() => navigate('/recruiter/jobs')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/recruiter/jobs')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
      >
        <FaArrowLeft className="w-4 h-4" />
        <span>Back to Jobs</span>
      </button>

      {/* Job Header */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {job.companyLogoUrl ? (
              <img
                src={job.companyLogoUrl}
                alt={job.companyName}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <FaBuilding className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-800">{job.title}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    job.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {job.isActive ? 'Active' : 'Closed'}
                </span>
              </div>
              <p className="text-lg text-gray-600 mb-3">{job.companyName}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-400" />
                  Posted on {formatDate(job.createdAt)}
                </div>
                <div className="flex items-center">
                  <FaUser className="w-4 h-4 mr-2 text-gray-400" />
                  {job.experienceLevel}
                </div>
                <div className="flex items-center">
                  <FaDollarSign className="w-4 h-4 mr-2 text-gray-400" />
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                </div>
                <div className="flex items-center">
                  <FaUsers className="w-4 h-4 mr-2 text-gray-400" />
                  {job.applicationCount || 0} applications
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            job.jobType === 'Full-time' ? 'bg-blue-100 text-blue-700' :
            job.jobType === 'Part-time' ? 'bg-green-100 text-green-700' :
            job.jobType === 'Contract' ? 'bg-purple-100 text-purple-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {job.jobType}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            job.workMode === 'Remote' ? 'bg-green-100 text-green-700' :
            job.workMode === 'Hybrid' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {job.workMode}
          </span>
        </div>

        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded"
              >
                {skill.skillName}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleViewApplications}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
          >
            <FaEye className="w-5 h-5" />
            <span>View Applications ({job.applicationCount || 0})</span>
          </button>
          <button
            onClick={handleEdit}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <FaEdit className="w-5 h-5" />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <FaTrash className="w-5 h-5" />
            <span>{deleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </div>

      {/* Job Description */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Job Description</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
        </div>
      </div>

      {/* Requirements */}
      {job.requirements && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Requirements</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
          </div>
        </div>
      )}

      {/* Benefits */}
      {job.benefits && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Benefits</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{job.benefits}</p>
          </div>
        </div>
      )}

      {/* Job Modal */}
      {showJobModal && (
        <JobModal
          job={job}
          onClose={() => setShowJobModal(false)}
          onSave={handleJobSaved}
        />
      )}
    </div>
  );
};

export default JobDetail;

