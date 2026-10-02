import { LANGUAGES } from '@const/enums';

export const CHANGE_PASSWORD_COPY = {
  [LANGUAGES.english]: {
    title: 'Change password',
    description: 'Your password must contain at least 8 characters, one uppercase Latin letter, and one number.',
    passwordLabel: 'New password',
    passwordPlaceholder: 'Enter your new password',
    confirmationLabel: 'Repeat new password',
    confirmationPlaceholder: 'Repeat your new password',
    mismatch: 'Passwords must match',
    submit: 'Change password',
  },
  [LANGUAGES.russian]: {
    title: 'Смена пароля',
    description: 'Пароль должен содержать не менее 8 символов, одну заглавную латинскую букву и одну цифру.',
    passwordLabel: 'Новый пароль',
    passwordPlaceholder: 'Введите новый пароль',
    confirmationLabel: 'Повторите новый пароль',
    confirmationPlaceholder: 'Повторите новый пароль',
    mismatch: 'Пароли должны совпадать',
    submit: 'Поменять пароль',
  },
} as const;

export const CHANGE_PASSWORD_TEXT = CHANGE_PASSWORD_COPY[LANGUAGES.russian];

export const CHANGE_PASSWORD_TEST_ID = {
  input: 'change-password-input',
  confirmationInput: 'change-password-confirmation-input',
  visibility: 'change-password-visibility',
  confirmationVisibility: 'change-password-confirmation-visibility',
  requirements: 'change-password-requirements',
  submit: 'change-password-submit',
} as const;

export const getChangePasswordValidation = (language: LANGUAGES) =>
  ({
    required: language === LANGUAGES.english ? 'Required' : 'Обязательно для заполнения',
    validate: (value: string) => {
      if (value.length < 8) {
        return language === LANGUAGES.english
          ? 'Password must be at least 8 characters long'
          : 'Длина пароля должна быть не менее 8 символов';
      }
      if (!/[A-Z]/.test(value)) {
        return language === LANGUAGES.english
          ? 'Password must contain at least one uppercase Latin letter'
          : 'Пароль должен содержать хотя бы одну заглавную латинскую букву';
      }
      if (!/\d/.test(value)) {
        return language === LANGUAGES.english
          ? 'Password must contain at least one number'
          : 'Пароль должен содержать хотя бы одну цифру';
      }
      return true;
    },
  }) as const;
