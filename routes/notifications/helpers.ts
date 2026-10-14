import { LANGUAGES } from '@const/enums';
import { NOTIFICATION_COPY, NOTIFICATION_TIME_LOCALE } from './constants';
import type { NotificationDisplayCopy, NotificationLocale } from './types';
import type { NotificationItem } from '@R/services/notifications/types';

export function getNotificationLocale(language: string): NotificationLocale {
  return language === LANGUAGES.russian ? 'russian' : 'english';
}

export function getNotificationDisplayCopy(
  item: NotificationItem,
  locale: NotificationLocale,
): NotificationDisplayCopy {
  const copy = NOTIFICATION_COPY[locale];
  const actor = [item.actorName, item.actorSurname].filter(Boolean).join(' ') || copy.genericActor;
  const title = (template: string) => template.replace('{actor}', actor);
  switch (item.type) {
    case 'activity-like':
      return { title: title(copy.activityLikeTitle), body: copy.activityLikeBody };
    case 'comment':
      return { title: title(copy.commentTitle), body: item.content || copy.commentBody };
    case 'comment-like':
      return { title: title(copy.commentLikeTitle), body: item.content || copy.commentLikeBody };
    default:
      return { title: copy.genericTitle, body: item.content || '' };
  }
}

export function getNotificationRelativeTime(createdAt: string, locale: NotificationLocale, now = Date.now()) {
  const seconds = Math.max(0, Math.round((now - new Date(createdAt).getTime()) / 1000));
  const formatter = new Intl.RelativeTimeFormat(NOTIFICATION_TIME_LOCALE[locale], { numeric: 'auto' });
  if (seconds < 60) return formatter.format(-seconds, 'second');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return formatter.format(-minutes, 'minute');
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return formatter.format(-hours, 'hour');
  const days = Math.floor(hours / 24);
  if (days < 30) return formatter.format(-days, 'day');
  const months = Math.floor(days / 30);
  if (months < 12) return formatter.format(-months, 'month');
  return formatter.format(-Math.floor(days / 365), 'year');
}

export function getNotificationAvatarLabel(item: NotificationItem, fallback: string) {
  const actor = [item.actorName, item.actorSurname].filter(Boolean).join(' ');
  return actor ? actor.slice(0, 1).toUpperCase() : fallback;
}
