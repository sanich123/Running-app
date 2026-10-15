import { getNextNotificationCursor, getNotificationPageUrl, getUnreadNotificationCount } from './utils';

describe('notification API utilities', () => {
  it('builds a first-page URL and safely encodes an opaque cursor', () => {
    expect(getNotificationPageUrl()).toBe('/notification?take=30');
    expect(getNotificationPageUrl('cursor with spaces')).toBe('/notification?take=30&cursor=cursor%20with%20spaces');
  });

  it('normalizes number and object unread-count responses', () => {
    expect(getUnreadNotificationCount(4)).toBe(4);
    expect(getUnreadNotificationCount({ count: 2 })).toBe(2);
  });

  it('returns a cursor only when the page has a next page', () => {
    expect(getNextNotificationCursor({ notifications: [], hasMore: true, nextCursor: 'next-1' })).toBe('next-1');
    expect(getNextNotificationCursor({ notifications: [], hasMore: false, nextCursor: null })).toBeUndefined();
  });
});
