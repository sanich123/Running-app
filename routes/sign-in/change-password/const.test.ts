import { LANGUAGES } from '@const/enums';
import { getChangePasswordValidation } from './const';

describe('change password validation copy', () => {
  it.each([
    [LANGUAGES.english, 'Required'],
    [LANGUAGES.russian, 'Обязательно для заполнения'],
  ] as const)('returns the required message for %s', (language, message) => {
    expect(getChangePasswordValidation(language).required).toBe(message);
  });

  it.each([
    [LANGUAGES.english, 'short1', 'Password must be at least 8 characters long'],
    [LANGUAGES.russian, 'short1', 'Длина пароля должна быть не менее 8 символов'],
    [LANGUAGES.english, 'password1', 'Password must contain at least one uppercase Latin letter'],
    [LANGUAGES.russian, 'password1', 'Пароль должен содержать хотя бы одну заглавную латинскую букву'],
    [LANGUAGES.english, 'Password', 'Password must contain at least one number'],
    [LANGUAGES.russian, 'Password', 'Пароль должен содержать хотя бы одну цифру'],
  ] as const)('validates %s password %s', (language, password, message) => {
    expect(getChangePasswordValidation(language).validate(password)).toBe(message);
  });

  it.each([LANGUAGES.english, LANGUAGES.russian] as const)('accepts a valid %s password', (language) => {
    expect(getChangePasswordValidation(language).validate('Password1')).toBe(true);
  });
});
