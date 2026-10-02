import { LANGUAGES } from '@const/enums';
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

    expect(russian('пароль-123')).toBe('Пароль должен состоять только из латинских символов');
    expect(english('пароль-123')).toBe('Password must contain Latin characters only');
    expect(russian('short')).toBe('Длина пароля должна быть не менее 8 символов');
    expect(english('short')).toBe('Password must be at least 8 characters long');
    expect(russian('a'.repeat(32))).toBe('Длина пароля должна быть не более 32 символов');
    expect(english('a'.repeat(32))).toBe('Password must be no more than 32 characters long');
    expect(russian('correct-horse')).toBe(true);
    expect(english('correct-horse')).toBe(true);
  });

  it('validates general email addresses with localized messages', () => {
    const russian = getEmailValidation(LANGUAGES.russian);
    const english = getEmailValidation(LANGUAGES.english);

    expect(russian.required).toBe('Обязательно для заполнения');
    expect(english.required).toBe('Required');
    expect(russian.validate('invalid-email')).toBe('Адрес электронной почты должен быть правильным');
    expect(english.validate('invalid-email')).toBe('Enter a valid email address');
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
    expect(russianRegistration.validate('bad address')).toBe('Адрес электронной почты должен быть правильным');
    expect(englishRegistration.validate('bad address')).toBe('Enter a valid email address');
    expect(russianRegistration.validate('runner@example.com')).toBe(
      'Для регистрации используйте адрес российского почтового оператора (.ru или .рф)',
    );
    expect(englishRegistration.validate('runner@example.com')).toBe(
      'For registration, use an email address from a Russian provider (.ru or .рф)',
    );
    expect(russianRegistration.validate('runner@example.ru')).toBe(true);
    expect(englishRegistration.validate('runner@example.xn--p1ai')).toBe(true);
  });
});
