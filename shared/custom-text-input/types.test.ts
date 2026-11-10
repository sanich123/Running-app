import { LANGUAGES } from '@const/enums';
import { CUSTOM_TEXT_INPUT_VALIDATION_COPY } from './const';
import {
  getEmailValidation,
  getPasswordValidation,
  getRegistrationEmailValidation,
  isRussianEmailAddress,
} from './types';

describe('custom text input validation rules', () => {
  it('validates password character set and length in Russian and English', () => {
    const russian = getPasswordValidation(LANGUAGES.russian).validate;
    const english = getPasswordValidation(LANGUAGES.english).validate;

    expect(russian('пароль-123')).toBe(CUSTOM_TEXT_INPUT_VALIDATION_COPY[LANGUAGES.russian].passwordLatinOnly);
    expect(english('пароль-123')).toBe(CUSTOM_TEXT_INPUT_VALIDATION_COPY[LANGUAGES.english].passwordLatinOnly);
    expect(russian('short')).toBe(CUSTOM_TEXT_INPUT_VALIDATION_COPY[LANGUAGES.russian].passwordMinimumLength);
    expect(english('short')).toBe(CUSTOM_TEXT_INPUT_VALIDATION_COPY[LANGUAGES.english].passwordMinimumLength);
    expect(russian('a'.repeat(32))).toBe(CUSTOM_TEXT_INPUT_VALIDATION_COPY[LANGUAGES.russian].passwordMaximumLength);
    expect(english('a'.repeat(32))).toBe(CUSTOM_TEXT_INPUT_VALIDATION_COPY[LANGUAGES.english].passwordMaximumLength);
    expect(russian('correct-horse')).toBe(true);
    expect(english('correct-horse')).toBe(true);
  });

  it('validates general email addresses with localized messages', () => {
    const russian = getEmailValidation(LANGUAGES.russian);
    const english = getEmailValidation(LANGUAGES.english);

    expect(russian.required).toBe(CUSTOM_TEXT_INPUT_VALIDATION_COPY[LANGUAGES.russian].required);
    expect(english.required).toBe(CUSTOM_TEXT_INPUT_VALIDATION_COPY[LANGUAGES.english].required);
    expect(russian.validate('invalid-email')).toBe(CUSTOM_TEXT_INPUT_VALIDATION_COPY[LANGUAGES.russian].invalidEmail);
    expect(english.validate('invalid-email')).toBe(CUSTOM_TEXT_INPUT_VALIDATION_COPY[LANGUAGES.english].invalidEmail);
    expect(russian.validate('runner@example.com')).toBe(true);
    expect(english.validate('runner@example.com')).toBe(true);
  });

  it('accepts Russian provider domains and rejects missing or foreign domains', () => {
    expect(isRussianEmailAddress('  Runner@Yandex.RU ')).toBe(true);
    expect(isRussianEmailAddress('runner@example.рф')).toBe(true);
    expect(isRussianEmailAddress('runner@example.xn--p1ai')).toBe(true);
    expect(isRussianEmailAddress('@example.ru')).toBe(false);
    expect(isRussianEmailAddress('runner@')).toBe(false);
    expect(isRussianEmailAddress('runner@example.com')).toBe(false);

    const russianRegistration = getRegistrationEmailValidation(LANGUAGES.russian);
    const englishRegistration = getRegistrationEmailValidation(LANGUAGES.english);
    expect(russianRegistration.validate('bad address')).toBe(
      CUSTOM_TEXT_INPUT_VALIDATION_COPY[LANGUAGES.russian].invalidEmail,
    );
    expect(englishRegistration.validate('bad address')).toBe(
      CUSTOM_TEXT_INPUT_VALIDATION_COPY[LANGUAGES.english].invalidEmail,
    );
    expect(russianRegistration.validate('runner@example.com')).toBe(
      CUSTOM_TEXT_INPUT_VALIDATION_COPY[LANGUAGES.russian].russianProviderRequired,
    );
    expect(englishRegistration.validate('runner@example.com')).toBe(
      CUSTOM_TEXT_INPUT_VALIDATION_COPY[LANGUAGES.english].russianProviderRequired,
    );
    expect(russianRegistration.validate('runner@example.ru')).toBe(true);
    expect(englishRegistration.validate('runner@example.xn--p1ai')).toBe(true);
  });
});
