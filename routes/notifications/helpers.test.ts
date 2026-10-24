import { LANGUAGES } from '@const/enums';
import {
  getNotificationAvatarLabel,
  getNotificationDisplayCopy,
  getNotificationIcon,
  getNotificationLocale,
  getNotificationRelativeTime,
} from './helpers';
import type { NotificationItem } from '@R/services/notifications/types';

const now = Date.parse('2026-10-14T12:00:00.000Z');
function item(overrides: Partial<NotificationItem> = {}): NotificationItem {
  return {
    id: 'notification-1',
    type: 'activity-like',
    targetType: 'activity',
    targetId: 'activity-1',
    relatedId: null,
    actorName: 'Alice',
    actorSurname: 'Runner',
    actorProfilePhoto: null,
    content: null,
    createdAt: new Date(now).toISOString(),
    readAt: null,
    ...overrides,
  };
}

describe('notification display helpers', () => {
  it('maps supported and unknown app languages to a display locale', () => {
    expect(getNotificationLocale(LANGUAGES.russian)).toBe('russian');
    expect(getNotificationLocale(LANGUAGES.english)).toBe('english');
    expect(getNotificationLocale('unknown')).toBe('english');
  });

  it('builds all Russian event messages with fallback actor and optional content', () => {
    expect(getNotificationDisplayCopy(item(), 'russian').title).toContain('Alice Runner');
    expect(
      getNotificationDisplayCopy(item({ type: 'comment', actorName: null, actorSurname: null }), 'russian').title,
    ).toContain('Пользователь');
    expect(getNotificationDisplayCopy(item({ type: 'comment' }), 'russian').body).toContain('посмотреть комментарий');
    expect(getNotificationDisplayCopy(item({ type: 'comment', content: 'Text' }), 'russian').body).toBe('Text');
    expect(getNotificationDisplayCopy(item({ type: 'comment-like' }), 'russian').body).toContain('обсуждение');
    expect(getNotificationDisplayCopy(item({ type: 'comment-like', content: 'Reply' }), 'russian').body).toBe('Reply');
    expect(getNotificationDisplayCopy(item({ type: 'unknown', content: 'Extra' }), 'russian').body).toBe('Extra');
    expect(getNotificationDisplayCopy(item({ type: 'unknown' }), 'russian').body).toBe('');
  });

  it('formats English copy and returns an empty body for an unknown event without content', () => {
    expect(getNotificationDisplayCopy(item({ type: 'activity-like' }), 'english').title).toContain(
      'liked your activity',
    );
    expect(getNotificationDisplayCopy(item({ type: 'comment' }), 'english').body).toContain('read the comment');
    expect(getNotificationDisplayCopy(item({ type: 'comment-like' }), 'english').title).toContain('liked your comment');
    expect(getNotificationDisplayCopy(item({ type: 'unknown' }), 'english').title).toBe('New notification');
  });

  it.each([0, 60, 60 * 60, 24 * 60 * 60, 30 * 24 * 60 * 60, 365 * 24 * 60 * 60])(
    'formats relative time for %i seconds ago',
    (secondsAgo) => {
      const timestamp = new Date(now - secondsAgo * 1000).toISOString();
      expect(getNotificationRelativeTime(timestamp, 'english', now)).toEqual(expect.any(String));
    },
  );

  it('clamps future timestamps and produces localized Russian relative time', () => {
    expect(getNotificationRelativeTime(new Date(now + 10_000).toISOString(), 'english', now)).toBe('now');
    expect(getNotificationRelativeTime(new Date(now - 60_000).toISOString(), 'russian', now)).toContain('минут');
  });

  it('uses the first actor initial or a fallback for the avatar', () => {
    expect(getNotificationAvatarLabel(item(), '?')).toBe('A');
    expect(getNotificationAvatarLabel(item({ actorName: null, actorSurname: null }), '?')).toBe('?');
  });

  it('uses moderation icons for report notifications', () => {
    expect(getNotificationIcon('moderation-report-received')).toBe('flag-outline');
    expect(getNotificationIcon('moderation-report-decision')).toBe('shield-check-outline');
    expect(getNotificationIcon('activity-like')).toBeUndefined();
  });
});
