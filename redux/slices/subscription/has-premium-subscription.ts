import type { SubscriptionState } from './types';

const PREMIUM_STATUSES = new Set<SubscriptionState['status']>(['active', 'cancelled']);

export function hasPremiumSubscription(
  subscription: SubscriptionState,
  currentUserId: string | null,
  now = Date.now(),
): boolean {
  if (
    !currentUserId ||
    subscription.userId !== currentUserId ||
    !subscription.isPremium ||
    !PREMIUM_STATUSES.has(subscription.status)
  ) {
    return false;
  }

  if (subscription.startsAt !== null) {
    const startsAt = Date.parse(subscription.startsAt ?? '');
    if (!Number.isFinite(startsAt) || now < startsAt) return false;
  }

  if (subscription.expiresAt !== null) {
    const expiresAt = Date.parse(subscription.expiresAt ?? '');
    if (!Number.isFinite(expiresAt) || now >= expiresAt) return false;
  }

  return true;
}
