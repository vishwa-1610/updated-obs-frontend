// src/context/OnboardingContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import api from '../api';

const OnboardingContext = createContext();

// Map Backend 'step_name' to Frontend Routes
const STEP_ROUTE_MAPPING = {
  'Personal Details': '/personal-details',
  'Emergency Contact': '/emergency-contact',
  'W2': '/federal', // Assuming W2 refers to Federal Tax in your context
  'State W4': '/state',
  'I9': '/i9',
  'Direct Deposit Form': '/direct-deposit',
  // Future mappings for company specific docs
  'Insurance Details': '/doc-view/insurance', 
  'Employee Hand Book': '/doc-view/handbook',
};

export const OnboardingProvider = ({ children }) => {
  const [workflow, setWorkflow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = searchParams.get('token');

  // 1. Fetch Company Workflow on Load
  useEffect(() => {
    if (!token) return;

    // Use the public endpoint you defined in Company views
    api.get('/workflow-steps/') 
      .then(res => {
        // Filter only active steps and sort by sort_order
        const activeSteps = res.data
          .filter(step => step.is_active)
          .sort((a, b) => a.sort_order - b.sort_order);
        setWorkflow(activeSteps);
      })
      .catch(err => console.error("Failed to load workflow", err))
      .finally(() => setLoading(false));
  }, [token]);

  // 2. Logic to Find Next Step
  const goToNextStep = () => {
    // Find the current active step based on the URL path
    const currentStepIndex = workflow.findIndex(step => 
      location.pathname.includes(STEP_ROUTE_MAPPING[step.step_name])
    );

    if (currentStepIndex === -1) {
      // Fallback: If we are lost, go to first step
      if (workflow.length > 0) {
        navigate(`${STEP_ROUTE_MAPPING[workflow[0].step_name]}?token=${token}`);
      }
      return;
    }

    const nextStep = workflow[currentStepIndex + 1];

    if (nextStep) {
      // Navigate to the next route defined in the workflow
      const nextRoute = STEP_ROUTE_MAPPING[nextStep.step_name];
      navigate(`${nextRoute}?token=${token}`);
    } else {
      // No more steps? We are done.
      alert("Onboarding Workflow Completed!");
      // Optionally redirect to a thank you page
    }
  };

  return (
    <OnboardingContext.Provider value={{ workflow, loading, goToNextStep }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);