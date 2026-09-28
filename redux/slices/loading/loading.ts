import { createSlice } from '@reduxjs/toolkit';

interface LoadingState {
  isLoading: boolean;
  activeOperations: number;
}

const initialState: LoadingState = { isLoading: false, activeOperations: 0 };

const loading = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.activeOperations += 1;
      state.isLoading = true;
    },
    finishLoading: (state) => {
      state.activeOperations = Math.max(0, state.activeOperations - 1);
      state.isLoading = state.activeOperations > 0;
    },
    resetLoading: (state) => {
      state.activeOperations = 0;
      state.isLoading = false;
    },
  },
});

export const { startLoading, finishLoading, resetLoading } = loading.actions;

export default loading.reducer;
