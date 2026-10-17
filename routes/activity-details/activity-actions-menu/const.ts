import { LANGUAGES } from '@const/enums';

export const ACTIVITY_ACTIONS_MENU = {
  [LANGUAGES.english]: {
    edit: 'Edit',
    delete: 'Delete',
    accessibilityLabel: 'Workout actions',
  },
  [LANGUAGES.russian]: {
    edit: 'Редактировать',
    delete: 'Удалить',
    accessibilityLabel: 'Действия с тренировкой',
  },
} as const;

export const ACTIVITY_ACTIONS_MENU_TEST_IDS = {
  trigger: 'activity-actions-menu-trigger',
  edit: 'activity-actions-menu-edit',
  delete: 'activity-actions-menu-delete',
} as const;
