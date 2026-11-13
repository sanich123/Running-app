import { LANGUAGES } from '@const/enums';

export const DELETE_ACCOUNT = {
  [LANGUAGES.russian]: {
    deletingAccount: 'Удаление аккаунта',
    conscentDeleting:
      'Удалятся аккаунт и связанные данные. Если вы входили через Apple, после удаления проверьте, что Runich больше не указан среди приложений, использующих ваш Apple ID.',
    sure: 'Да, я знаю',
    action: 'Удалить аккаунт',
  },
  [LANGUAGES.english]: {
    deletingAccount: 'Deleting account',
    conscentDeleting:
      'Your account and related data will be deleted. If you used Apple sign-in, check after deletion that Runich is no longer listed among apps using your Apple Account.',
    sure: 'Yes, I am sure',
    action: 'Delete account',
  },
};
