import { configureStore } from '@reduxjs/toolkit';
import clientReducer from './clientSlice';
import subcontractorReducer from './subcontractorSlice';
import employeeReducer from './employeeSlice';
import templateReducer from './templateSlice';
import onboardingReducer from './onboardingSlice';
import companyIntakeReducer from './companyIntakeSlice';
import authReducer from './authSlice';
import reportReducer from './reportSlice';

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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
