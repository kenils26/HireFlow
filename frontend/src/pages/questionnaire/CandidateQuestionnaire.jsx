import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1About from '../../components/questionnaire/candidate/Step1About';
import Step2Education from '../../components/questionnaire/candidate/Step2Education';
import Step3Experience from '../../components/questionnaire/candidate/Step3Experience';
import Step4Resume from '../../components/questionnaire/candidate/Step4Resume';
import { getCurrentUser } from '../../services/authService';

const CandidateQuestionnaire = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await getCurrentUser();
        if (response.success && response.data.user) {
          setUserData(response.data.user);
          // If questionnaire is already completed, redirect to dashboard
          if (response.data.user.candidateProfile?.questionnaireCompleted) {
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Navigate to dashboard after completing questionnaire
    navigate('/dashboard');
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {currentStep === 1 && (
          <Step1About
            userData={userData}
            onNext={handleNext}
            onBack={handleBack}
            currentStep={currentStep}
          />
        )}
        {currentStep === 2 && (
          <Step2Education
            onNext={handleNext}
            onBack={handleBack}
            currentStep={currentStep}
          />
        )}
        {currentStep === 3 && (
          <Step3Experience
            onNext={handleNext}
            onBack={handleBack}
            currentStep={currentStep}
          />
        )}
        {currentStep === 4 && (
          <Step4Resume
            onComplete={handleComplete}
            onBack={handleBack}
            currentStep={currentStep}
          />
        )}
      </div>
    </div>
  );
};

export default CandidateQuestionnaire;

