// src/redux./store.js
import { configureStore } from '@reduxjs/toolkit';
import portfolioReducer from './portfolioSlice';

export const store = configureStore({
  reducer: {
    portfolios: portfolioReducer,
  },
});