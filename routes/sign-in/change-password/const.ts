export const CHANGE_PASSWORD_TEXT = {
  title: 'Смена пароля',
  description: 'Пароль должен содержать не менее 8 символов, одну заглавную латинскую букву и одну цифру.',
  passwordLabel: 'Новый пароль',
  passwordPlaceholder: 'Введите новый пароль',
  confirmationLabel: 'Повторите новый пароль',
  confirmationPlaceholder: 'Повторите новый пароль',
  mismatch: 'Пароли должны совпадать',
  submit: 'Поменять пароль',
} as const;

export const CHANGE_PASSWORD_TEST_ID = {
  input: 'change-password-input',
  confirmationInput: 'change-password-confirmation-input',
  visibility: 'change-password-visibility',
  confirmationVisibility: 'change-password-confirmation-visibility',
  requirements: 'change-password-requirements',
  submit: 'change-password-submit',
} as const;

export const changePasswordValidation = {
  required: 'Обязательно для заполнения',
  validate: (value: string) => {
    if (value.length < 8) {
      return 'Длина пароля должна быть не менее 8 символов';
    }
    if (!/[A-Z]/.test(value)) {
      return 'Пароль должен содержать хотя бы одну заглавную латинскую букву';
    }
    if (!/\d/.test(value)) {
      return 'Пароль должен содержать хотя бы одну цифру';
    }
    return true;
  },
} as const;
