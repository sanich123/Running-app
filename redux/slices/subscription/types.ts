import type { SubscriptionStatus } from '@R/services/subscription/types';

export interface SubscriptionState {
  userId: string | null;
  isPremium: boolean;
  status: SubscriptionStatus;
  provider: string | null;
  productId: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  cancelAtPeriodEnd: boolean;
}
