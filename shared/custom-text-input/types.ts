import isEmail from 'validator/lib/isEmail';
import type { InputModeOptions, ReturnKeyTypeOptions } from 'react-native';
import type { Control, FieldValues, Path, ValidateResult } from 'react-hook-form';
export interface CustomTextInputProps<T extends FieldValues> {
  label: string;
  control?: Control<T>;
  fieldName: Path<T>;
  validation?: {
    required: string;
    validate?: (value: any) => ValidateResult | Promise<ValidateResult>;
    pattern?: {
      value: RegExp;
      message: string;
    };
  };
  stateValue?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  returnKeyType?: ReturnKeyTypeOptions;
  returnKeyLabel?: string;
  callback?: (arg: any) => void;
  inputMode?: InputModeOptions;
  multiline?: boolean;
  numberOfLines?: number;
  replaceCommaToDot?: boolean;
  autoComplete?:
    | 'additional-name'
    | 'address-line1'
    | 'address-line2'
    | 'birthdate-day'
    | 'birthdate-full'
    | 'birthdate-month'
    | 'birthdate-year'
    | 'cc-csc'
    | 'cc-exp'
    | 'cc-exp-day'
    | 'cc-exp-month'
    | 'cc-exp-year'
    | 'cc-number'
    | 'cc-name'
    | 'cc-given-name'
    | 'cc-middle-name'
    | 'cc-family-name'
    | 'cc-type'
    | 'country'
    | 'current-password'
    | 'email'
    | 'family-name'
    | 'gender'
    | 'given-name'
    | 'honorific-prefix'
    | 'honorific-suffix'
    | 'name'
    | 'name-family'
    | 'name-given'
    | 'name-middle'
    | 'name-middle-initial'
    | 'name-prefix'
    | 'name-suffix'
    | 'new-password'
    | 'nickname'
    | 'one-time-code'
    | 'organization'
    | 'organization-title'
    | 'password'
    | 'password-new'
    | 'postal-address'
    | 'postal-address-country'
    | 'postal-address-extended'
    | 'postal-address-extended-postal-code'
    | 'postal-address-locality'
    | 'postal-address-region'
    | 'postal-code'
    | 'street-address'
    | 'sms-otp'
    | 'tel'
    | 'tel-country-code'
    | 'tel-national'
    | 'tel-device'
    | 'url'
    | 'username'
    | 'username-new'
    | 'off';
  capitalizeValue?: boolean;
  onSubmitEditing?: () => void;
  accessibilityLabel?: string;
  compact?: boolean;
}

export const passwordValidation = {
  required: 'Обязательно для заполнения',
  validate: (value: string) => {
    if (value.match(/[а-яёА-ЯЁ]/)) {
      return 'Пароль должен состоять только из латинских символов';
    }
    if (value.length < 8) {
      return 'Длина пароля должна быть не менее 8 символов';
    }
    if (value.length >= 32) {
      return 'Длина пароля должна быть не более 32 символов';
    }
    return true;
  },
};

export const emailValidation = {
  required: 'Обязательно для заполнения',
  validate: (value: string) => {
    if (!isEmail(value)) {
      return 'Адрес электронной почты должен быть правильным';
    }
    return true;
  },
};
