import { LANGUAGES } from '../../constants/enums';

export type EmailInputProps = {
  email: string;
  setEmail: (arg: string) => void;
  emailError: boolean;
  setEmailError: (arg: boolean) => void;
  isDisabled: boolean;
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
};

export const EMAIL_INPUT_TEST_ID = 'inputEmail';
export const EMAIL_INPUT_LEFT_ICON = 'inputEmailLeftIcon';
