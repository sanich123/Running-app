import { LANGUAGES } from '@const/enums';
import { NOTIFICATION_COPY } from './constants';
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
    case 'moderation-report-received':
      return { title: copy.moderationReportReceivedTitle, body: item.content || '' };
    case 'moderation-report-decision':
      return { title: copy.moderationReportDecisionTitle, body: item.content || '' };
    default:
      return { title: copy.genericTitle, body: item.content || '' };
  }
}

export function getNotificationRelativeTime(createdAt: string, locale: NotificationLocale, now = Date.now()) {
  const seconds = Math.max(0, Math.round((now - new Date(createdAt).getTime()) / 1000));
  if (seconds === 0) return locale === 'russian' ? 'сейчас' : 'now';
  if (seconds < 60) return formatNotificationRelativeUnit(seconds, 'second', locale);
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return formatNotificationRelativeUnit(minutes, 'minute', locale);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return formatNotificationRelativeUnit(hours, 'hour', locale);
  const days = Math.floor(hours / 24);
  if (days === 1) return locale === 'russian' ? 'вчера' : 'yesterday';
  if (days < 30) return formatNotificationRelativeUnit(days, 'day', locale);
  const months = Math.floor(days / 30);
  if (months < 12) return formatNotificationRelativeUnit(months, 'month', locale);
  return formatNotificationRelativeUnit(Math.floor(days / 365), 'year', locale);
}

type NotificationRelativeUnit = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';

function formatNotificationRelativeUnit(value: number, unit: NotificationRelativeUnit, locale: NotificationLocale) {
  if (locale === 'english') {
    const labels: Record<NotificationRelativeUnit, string> = {
      second: 'second',
      minute: 'minute',
      hour: 'hour',
      day: 'day',
      month: 'month',
      year: 'year',
    };
    const label = labels[unit];
    return `${value} ${label}${value === 1 ? '' : 's'} ago`;
  }

  const lastDigit = value % 10;
  const lastTwoDigits = value % 100;
  const form =
    lastTwoDigits >= 11 && lastTwoDigits <= 14
      ? 'many'
      : lastDigit === 1
        ? 'one'
        : lastDigit >= 2 && lastDigit <= 4
          ? 'few'
          : 'many';
  const labels: Record<NotificationRelativeUnit, Record<typeof form, string>> = {
    second: { one: 'секунду', few: 'секунды', many: 'секунд' },
    minute: { one: 'минуту', few: 'минуты', many: 'минут' },
    hour: { one: 'час', few: 'часа', many: 'часов' },
    day: { one: 'день', few: 'дня', many: 'дней' },
    month: { one: 'месяц', few: 'месяца', many: 'месяцев' },
    year: { one: 'год', few: 'года', many: 'лет' },
  };
  return `${value} ${labels[unit][form]} назад`;
}

export function getNotificationAvatarLabel(item: NotificationItem, fallback: string) {
  const actor = [item.actorName, item.actorSurname].filter(Boolean).join(' ');
  return actor ? actor.slice(0, 1).toUpperCase() : fallback;
}

export function getNotificationIcon(type: string): string | undefined {
  switch (type) {
    case 'moderation-report-received':
      return 'flag-outline';
    case 'moderation-report-decision':
      return 'shield-check-outline';
    default:
      return undefined;
  }
}
