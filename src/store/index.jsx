import { configureStore } from '@reduxjs/toolkit';
import clientReducer from './clientSlice';
import subcontractorReducer from './subcontractorSlice';
import employeeReducer from './employeeSlice';
import templateReducer from './templateSlice';
import onboardingReducer from './onboardingSlice';
import companyIntakeReducer from './companyIntakeSlice';
import authReducer from './authSlice';
import reportReducer from './reportSlice';
import attendanceReducer from './attendanceSlice';
import taskReducer from './taskSlice';
import ruleEngineReducer from './ruleEngineSlice';
import jobReducer from './jobSlice';
import documentReducer from './documentSlice';

export const store = configureStore({
  reducer: {
    client: clientReducer,
    subcontractor: subcontractorReducer,
    employee: employeeReducer,
    template: templateReducer,
    onboarding: onboardingReducer,
    companyIntake: companyIntakeReducer,
    reports: reportReducer,
    auth: authReducer,
    attendance: attendanceReducer,
    tasks: taskReducer,
    ruleEngine: ruleEngineReducer,
    jobs: jobReducer,
    documents: documentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
