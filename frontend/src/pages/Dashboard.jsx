import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import Sidebar from '../components/Sidebar';
import CandidateDashboard from './candidate/CandidateDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await getCurrentUser();
        if (response.success && response.data.user) {
          setUser(response.data.user);
        } else {
          navigate('/signin');
        }
      } catch (error) {
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Sidebar>
      {user?.role === 'candidate' ? (
        <CandidateDashboard />
      ) : (
        <div className="p-6">
          <div className="bg-white rounded-xl shadow p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to your Dashboard</h2>
            <p className="text-gray-600">Your recruiter dashboard is coming soon!</p>
          </div>
        </div>
      )}
    </Sidebar>
  );
};

export default Dashboard;

