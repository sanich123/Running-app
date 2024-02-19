import { LANGUAGES } from '@const/enums';

export type PasswordInputProps = {
  password: string;
  setPassword: (arg: string) => void;
  passwordError: boolean;
  setPasswordError: (arg: boolean) => void;
  isDisabled: boolean;
};

export const PASSWORD_INPUT = {
  [LANGUAGES.english]: {
    label: 'Password',
    placeholder: 'Type your password',
    helperText: 'Password must contain one capital, one normal letter, one number, length up to 6',
  },
  [LANGUAGES.russian]: {
    label: 'Пароль',
    placeholder: 'Введите ваш пароль',
    helperText: 'Пароль должен состоять из одной заглавной, одной строчной буквы, одной цифры, не менее 6 символов',
  },
} as const;

export const PASSWORD_INPUT_TEST_ID = 'passwordInput';
export const PASSWORD_INPUT_LEFT_ICON = 'passwordInputPasswordLeftIcon';
export const PASSWORD_INPUT_RIGHT_ICON = 'passwordInputEyeIcon';
