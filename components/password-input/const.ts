import { LANGUAGES } from '@const/enums';
import { RefObject } from 'react';
import { TextInput } from 'react-native';

export type PasswordInputProps = {
  password: string;
  setPassword: (arg: string) => void;
  passwordError: boolean;
  setPasswordError: (arg: boolean) => void;
  isDisabled: boolean;
  passwordRef: RefObject<TextInput> | null;
};

export const PASSWORD_INPUT = {
  [LANGUAGES.english]: {
    label: 'Password',
    placeholder: 'Password',
    helperText: 'Capital and normal letter, number, 6+ symbols',
  },
  [LANGUAGES.russian]: {
    label: 'Пароль',
    placeholder: 'Пароль',
    helperText: 'Большая и маленькая буква, цифра, 6+',
  },
} as const;

export const PASSWORD_INPUT_TEST_ID = 'passwordInput';
export const PASSWORD_INPUT_LEFT_ICON = 'passwordInputPasswordLeftIcon';
export const PASSWORD_INPUT_RIGHT_ICON = 'passwordInputEyeIcon';
