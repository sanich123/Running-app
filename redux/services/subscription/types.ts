export type SubscriptionStatus = 'unknown' | 'none' | 'pending' | 'active' | 'cancelled' | 'expired';

export interface CurrentSubscriptionResponse {
  userId: string;
  isPremium: boolean;
  status: Exclude<SubscriptionStatus, 'unknown'>;
  provider: string | null;
  productId: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  cancelAtPeriodEnd: boolean;
}
