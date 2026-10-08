// src/context/OnboardingContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import api from '../api';

const OnboardingContext = createContext();

// Map Backend 'step_name' to Frontend Routes
export const STEP_ROUTE_MAPPING = {
  'Personal Details': '/personal-details',
  'Emergency Contact': '/emergency-contact',
  'W2': '/federal',
  'Federal Tax': '/federal',
  'State W4': '/state',
  'State Tax': '/state',
  'I9': '/i9',
  'Form I-9': '/i9',
  'Direct Deposit Form': '/direct-deposit',
  'Direct Deposit': '/direct-deposit',
  'Insurance Details': '/doc-view/insurance', 
  'Employee Hand Book': '/doc-view/handbook',
};

export const DEFAULT_WORKFLOW = [
  { id: 1, step_name: 'Personal Details', sort_order: 1, is_active: true },
  { id: 2, step_name: 'Emergency Contact', sort_order: 2, is_active: true },
  { id: 3, step_name: 'Federal Tax', sort_order: 3, is_active: true },
  { id: 4, step_name: 'State Tax', sort_order: 4, is_active: true },
  { id: 5, step_name: 'Form I-9', sort_order: 5, is_active: true },
  { id: 6, step_name: 'Direct Deposit', sort_order: 6, is_active: true },
];

export const OnboardingProvider = ({ children }) => {
  const [workflow, setWorkflow] = useState(DEFAULT_WORKFLOW);
  const [candidateInfo, setCandidateInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const tokenUrl = searchParams.get('token');
  const tokenStorage = localStorage.getItem('onboarding_token');
  const token = tokenUrl || tokenStorage;

  // 1. Fetch Company Workflow & Validate Candidate on Load
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    Promise.allSettled([
      api.get('/workflow-steps/'),
      api.get(`/onboarding/validate/${token}/`)
    ]).then(([workflowRes, validateRes]) => {
      if (!isMounted) return;

      if (workflowRes.status === 'fulfilled' && Array.isArray(workflowRes.value.data) && workflowRes.value.data.length > 0) {
        const activeSteps = workflowRes.value.data
          .filter(step => step.is_active)
          .sort((a, b) => a.sort_order - b.sort_order);
        if (activeSteps.length > 0) {
          setWorkflow(activeSteps);
        }
      }

      if (validateRes.status === 'fulfilled' && validateRes.value.data) {
        setCandidateInfo(validateRes.value.data);
      }
    }).catch(err => {
      console.warn("Workflow load note:", err);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [token]);

  // Current Step calculations
  const activeStepsList = useMemo(() => {
    return workflow && workflow.length > 0 ? workflow : DEFAULT_WORKFLOW;
  }, [workflow]);

  const currentStepIndex = useMemo(() => {
    const idx = activeStepsList.findIndex(step => {
      const route = STEP_ROUTE_MAPPING[step.step_name] || `/${step.step_name.toLowerCase().replace(/\s+/g, '-')}`;
      return location.pathname.includes(route);
    });
    return idx >= 0 ? idx : 0;
  }, [activeStepsList, location.pathname]);

  const currentStep = activeStepsList[currentStepIndex] || activeStepsList[0];
  const totalSteps = activeStepsList.length;
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  // 2. Logic to Find Next Step
  const goToNextStep = () => {
    if (currentStepIndex < activeStepsList.length - 1) {
      const nextStep = activeStepsList[currentStepIndex + 1];
      const nextRoute = STEP_ROUTE_MAPPING[nextStep.step_name] || `/${nextStep.step_name.toLowerCase().replace(/\s+/g, '-')}`;
      navigate(`${nextRoute}?token=${token}`);
    } else {
      // Completed all steps
      navigate(`/onboarding-completed?token=${token}`);
    }
  };

  const goToStep = (index) => {
    if (index >= 0 && index < activeStepsList.length) {
      const targetStep = activeStepsList[index];
      const targetRoute = STEP_ROUTE_MAPPING[targetStep.step_name] || `/${targetStep.step_name.toLowerCase().replace(/\s+/g, '-')}`;
      navigate(`${targetRoute}?token=${token}`);
    }
  };

  return (
    <OnboardingContext.Provider value={{ 
      workflow: activeStepsList, 
      loading, 
      candidateInfo, 
      token,
      currentStepIndex, 
      currentStep,
      totalSteps, 
      progressPercent,
      goToNextStep,
      goToStep 
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
export default OnboardingContext;