import { createSlice } from '@reduxjs/toolkit';
import { initialSubscriptionState } from './const';
import type { CurrentSubscriptionResponse } from '@R/services/subscription/types';
import type { PayloadAction } from '@reduxjs/toolkit';

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: initialSubscriptionState,
  reducers: {
    setSubscriptionSnapshot(state, { payload }: PayloadAction<CurrentSubscriptionResponse>) {
      state.userId = payload.userId;
      state.isPremium = payload.isPremium;
      state.status = payload.status;
      state.provider = payload.provider;
      state.productId = payload.productId;
      state.startsAt = payload.startsAt;
      state.expiresAt = payload.expiresAt;
      state.cancelAtPeriodEnd = payload.cancelAtPeriodEnd;
    },
    clearSubscriptionSnapshot() {
      return initialSubscriptionState;
    },
  },
});

export const { setSubscriptionSnapshot, clearSubscriptionSnapshot } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
