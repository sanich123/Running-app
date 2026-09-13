import { LANGUAGES } from './enums';

export const EMAIL_DELIVERY_NOTICE = {
  [LANGUAGES.english]:
    'The email may be filtered as spam. If you do not see it in your inbox, be sure to check your Spam or Junk folder and make sure the address is correct.',
  [LANGUAGES.russian]:
    'Письмо может попасть в папку «Спам». Если его нет во входящих, обязательно проверьте папку «Спам» и убедитесь, что адрес указан правильно.',
} as const;
