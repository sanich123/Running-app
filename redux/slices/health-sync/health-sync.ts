import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { HealthSyncState, HealthSyncStatus } from './types';

const initialState: HealthSyncState = { status: null };

const healthSync = createSlice({
  name: 'healthSync',
  initialState,
  reducers: {
    setHealthSyncStatus: (state, action: PayloadAction<HealthSyncStatus>) => {
      state.status = action.payload;
    },
    clearHealthSyncStatus: (state, action: PayloadAction<string | undefined>) => {
      if (!action.payload || state.status?.id === action.payload) state.status = null;
    },
  },
});

export const { setHealthSyncStatus, clearHealthSyncStatus } = healthSync.actions;
export default healthSync.reducer;
