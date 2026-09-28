import type { SubscriptionState } from './types';

export const initialSubscriptionState: SubscriptionState = {
  userId: null,
  isPremium: false,
  status: 'unknown',
  provider: null,
  productId: null,
  startsAt: null,
  expiresAt: null,
  cancelAtPeriodEnd: false,
};
