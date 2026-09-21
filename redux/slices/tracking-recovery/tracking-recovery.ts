import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { STATUSES } from '@const/enums';
import { TRACKING_RECOVERY_INITIAL_STATE, TRACKING_RECOVERY_METRICS_INITIAL_STATE } from './const';
import type { TrackingRecoveryMetrics } from './types';

const trackingRecovery = createSlice({
  name: 'trackingRecovery',
  initialState: TRACKING_RECOVERY_INITIAL_STATE,
  reducers: {
    startTrackingRecovery: (state, action: PayloadAction<string>) => {
      state.journalId = action.payload;
      state.status = STATUSES.started;
      state.pointCount = 0;
      state.lastTimestamp = null;
      state.metrics = TRACKING_RECOVERY_METRICS_INITIAL_STATE;
    },
    setTrackingRecoveryStartContext: (state, action: PayloadAction<{ startedAt: number; timeZone: string }>) => {
      state.metrics.recordingStartedAt = action.payload.startedAt;
      state.metrics.recordingTimeZone = action.payload.timeZone;
    },
    setTrackingRecoveryStatus: (state, action: PayloadAction<STATUSES>) => {
      state.status = action.payload;
    },
    setTrackingRecoveryProgress: (
      state,
      action: PayloadAction<{
        pointCount: number;
        lastTimestamp: number | null;
        metrics: TrackingRecoveryMetrics;
      }>,
    ) => {
      state.pointCount = action.payload.pointCount;
      state.lastTimestamp = action.payload.lastTimestamp;
      state.metrics = action.payload.metrics;
    },
    clearTrackingRecovery: () => TRACKING_RECOVERY_INITIAL_STATE,
  },
});

export const {
  startTrackingRecovery,
  setTrackingRecoveryStartContext,
  setTrackingRecoveryStatus,
  setTrackingRecoveryProgress,
  clearTrackingRecovery,
} = trackingRecovery.actions;

export default trackingRecovery.reducer;
