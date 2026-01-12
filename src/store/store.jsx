import { configureStore } from '@reduxjs/toolkit';
import clientReducer from './clientSlice';
import subcontractorReducer from './subcontractorSlice';

export const store = configureStore({
  reducer: {
    client: clientReducer,
    subcontractor: subcontractorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
