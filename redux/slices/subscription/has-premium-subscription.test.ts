import { hasPremiumSubscription } from './has-premium-subscription';
import type { SubscriptionState } from './types';

const NOW = Date.parse('2026-09-28T12:00:00.000Z');

const activeSubscription: SubscriptionState = {
  userId: 'user-1',
  isPremium: true,
  status: 'active',
  provider: 'manual',
  productId: 'annual',
  startsAt: '2026-09-01T00:00:00.000Z',
  expiresAt: '2027-09-01T00:00:00.000Z',
  cancelAtPeriodEnd: false,
};

describe('hasPremiumSubscription', () => {
  it('allows the matching account while an active subscription is within its dates', () => {
    expect(hasPremiumSubscription(activeSubscription, 'user-1', NOW)).toBe(true);
  });

  it('keeps cancelled access until the paid period expires', () => {
    expect(hasPremiumSubscription({ ...activeSubscription, status: 'cancelled' }, 'user-1', NOW)).toBe(true);
  });

  it.each([
    ['another signed-in account', 'user-2', activeSubscription],
    ['a signed-out account', null, activeSubscription],
    ['a future subscription', 'user-1', { ...activeSubscription, startsAt: '2026-10-01T00:00:00.000Z' }],
    ['an expired subscription', 'user-1', { ...activeSubscription, expiresAt: '2026-09-28T12:00:00.000Z' }],
    ['a non-premium status', 'user-1', { ...activeSubscription, isPremium: false }],
    ['a pending status', 'user-1', { ...activeSubscription, status: 'pending' }],
  ])('denies premium access for %s', (_description, userId, subscription) => {
    expect(hasPremiumSubscription(subscription as SubscriptionState, userId as string | null, NOW)).toBe(false);
  });

  it('denies access when the cached subscription dates are invalid', () => {
    expect(hasPremiumSubscription({ ...activeSubscription, expiresAt: 'invalid-date' }, 'user-1', NOW)).toBe(false);
  });
});
