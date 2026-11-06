import { LANGUAGES } from '@const/enums';

export const CUSTOM_TEXT_INPUT_VALIDATION_COPY = {
  [LANGUAGES.english]: {
    required: 'Required',
    passwordLatinOnly: 'Password must contain Latin characters only',
    passwordMinimumLength: 'Password must be at least 8 characters long',
    passwordMaximumLength: 'Password must be no more than 32 characters long',
    invalidEmail: 'Enter a valid email address',
    russianProviderRequired: 'For registration, use an email address from a Russian provider (.ru or .рф)',
  },
  [LANGUAGES.russian]: {
    required: 'Обязательно для заполнения',
    passwordLatinOnly: 'Пароль должен состоять только из латинских символов',
    passwordMinimumLength: 'Длина пароля должна быть не менее 8 символов',
    passwordMaximumLength: 'Длина пароля должна быть не более 32 символов',
    invalidEmail: 'Адрес электронной почты должен быть правильным',
    russianProviderRequired: 'Для регистрации используйте адрес российского почтового оператора (.ru или .рф)',
  },
} as const;
