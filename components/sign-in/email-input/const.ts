import { LANGUAGES } from '@const/enums';
import { RefObject } from 'react';
import { TextInput } from 'react-native';

export type EmailInputProps = {
  email: string;
  setEmail: (arg: string) => void;
  emailError: boolean;
  setEmailError: (arg: boolean) => void;
  isDisabled: boolean;
  passwordRef: RefObject<TextInput> | null;
};

export const EMAIL_INPUT = {
  [LANGUAGES.english]: {
    placeholder: 'Type your email',
    label: 'Email',
    helper: 'Email must be valid email address',
  },
  [LANGUAGES.russian]: {
    placeholder: 'Введите ваш email',
    label: 'Электронная почта',
    helper: 'Эл.почта должна быть валидной',
  },
} as const;

export const EMAIL_INPUT_TEST_ID = 'inputEmail';
export const EMAIL_INPUT_LEFT_ICON = 'inputEmailLeftIcon';
