import { LANGUAGES } from '@const/enums';

export const ACTIVITY_ACTIONS_MENU = {
  [LANGUAGES.english]: {
    edit: 'Edit',
    delete: 'Delete',
    downloadGpx: 'Download track as GPX',
    downloadFit: 'Download track as FIT',
    navigate: 'Navigate this route',
    defaultTrackName: 'Runich activity',
    sharingUnavailable: 'File sharing is unavailable on this device',
    trackExportFailed: 'Could not export activity route',
    navigationFailed: 'Could not start route navigation',
    report: 'Report activity',
    accessibilityLabel: 'Workout actions',
  },
  [LANGUAGES.russian]: {
    edit: 'Редактировать',
    delete: 'Удалить',
    downloadGpx: 'Скачать трек в GPX',
    downloadFit: 'Скачать трек в FIT',
    navigate: 'Навигация по треку',
    defaultTrackName: 'Активность Runich',
    sharingUnavailable: 'На этом устройстве нельзя поделиться файлом',
    trackExportFailed: 'Не удалось выгрузить маршрут активности',
    navigationFailed: 'Не удалось запустить навигацию по маршруту',
    report: 'Сообщить о нарушении',
    accessibilityLabel: 'Действия с тренировкой',
  },
} as const;

export const ACTIVITY_ACTIONS_MENU_TEST_IDS = {
  trigger: 'activity-actions-menu-trigger',
  edit: 'activity-actions-menu-edit',
  delete: 'activity-actions-menu-delete',
  report: 'activity-actions-menu-report',
  downloadGpx: 'activity-actions-menu-download-gpx',
  downloadFit: 'activity-actions-menu-download-fit',
  navigate: 'activity-actions-menu-navigate',
} as const;

export const ACTIVITY_DELETE_CONFIRMATION = {
  [LANGUAGES.english]: {
    deleteActivity: 'Delete activity?',
    question: 'This action cannot be undone.',
    accept: 'Delete',
    cancel: 'Cancel',
  },
  [LANGUAGES.russian]: {
    deleteActivity: 'Удалить активность?',
    question: 'Это действие нельзя отменить.',
    accept: 'Удалить',
    cancel: 'Отмена',
  },
} as const;
