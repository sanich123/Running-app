import isEmail from 'validator/lib/isEmail';
import type { InputModeOptions, ReturnKeyTypeOptions } from 'react-native';
import type { Control, FieldValues, Path, PathValue, ValidateResult } from 'react-hook-form';
import { CUSTOM_TEXT_INPUT_VALIDATION_COPY } from './const';
import type { LANGUAGES } from '@const/enums';
export interface CustomTextInputProps<T extends FieldValues> {
  label?: string;
  control?: Control<T>;
  fieldName: Path<T>;
  validation?: {
    required: string;
    validate?: (value: PathValue<T, Path<T>>) => ValidateResult | Promise<ValidateResult>;
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
  callback?: (value: string) => void;
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
  placeholder?: string;
  testID?: string;
  compact?: boolean;
}

export const getPasswordValidation = (language: LANGUAGES) => {
  const copy = CUSTOM_TEXT_INPUT_VALIDATION_COPY[language];
  return {
    required: copy.required,
    validate: (value: string) => {
      if (value.match(/[а-яёА-ЯЁ]/)) {
        return copy.passwordLatinOnly;
      }
      if (value.length < 8) {
        return copy.passwordMinimumLength;
      }
      if (value.length >= 32) {
        return copy.passwordMaximumLength;
      }
      return true;
    },
  };
};

const RUSSIAN_EMAIL_DOMAIN_SUFFIXES = ['.ru', '.рф', '.xn--p1ai'] as const;

export function isRussianEmailAddress(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const atIndex = normalizedEmail.lastIndexOf('@');
  if (atIndex <= 0 || atIndex === normalizedEmail.length - 1) return false;

  const domain = normalizedEmail.slice(atIndex + 1);
  return RUSSIAN_EMAIL_DOMAIN_SUFFIXES.some((suffix) => domain.endsWith(suffix));
}

export const getEmailValidation = (language: LANGUAGES) => {
  const copy = CUSTOM_TEXT_INPUT_VALIDATION_COPY[language];
  return {
    required: copy.required,
    validate: (value: string) => {
      if (!isEmail(value)) {
        return copy.invalidEmail;
      }
      return true;
    },
  };
};

export const getRegistrationEmailValidation = (language: LANGUAGES) => {
  const validation = getEmailValidation(language);
  return {
    required: validation.required,
    validate: (value: string) => {
      const emailError = validation.validate(value);
      if (emailError !== true) return emailError;
      if (!isRussianEmailAddress(value)) {
        return CUSTOM_TEXT_INPUT_VALIDATION_COPY[language].russianProviderRequired;
      }
      return true;
    },
  };
};
