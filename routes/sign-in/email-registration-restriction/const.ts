import { LANGUAGES } from '@const/enums';

export const EMAIL_REGISTRATION_RESTRICTION_COPY = {
  [LANGUAGES.russian]: {
    trigger: '* Регистрация по email — только с адресом российского почтового оператора (.ru или .рф).',
    title: 'Ограничение регистрации',
    description:
      'С 1 декабря 2023 года Федеральный закон от 31 июля 2023 г. № 406-ФЗ запретил российским сайтам регистрировать пользователей, находящихся в РФ, с использованием иностранной электронной почты. Поэтому Runich принимает email для регистрации только в российских доменных зонах .ru и .рф. Правило применяется ко всей регистрации по email; вход и восстановление доступа к ранее созданным аккаунтам не ограничиваются.',
    close: 'Закрыть',
  },
  [LANGUAGES.english]: {
    trigger: '* Email registration is available only with an address from a Russian email provider (.ru or .рф).',
    title: 'Email registration restriction',
    description:
      'From 1 December 2023, Federal Law No. 406-FZ of 31 July 2023 prohibited Russian websites from registering users located in Russia with foreign email. Therefore Runich accepts only .ru and .рф addresses for email registration. The rule applies to all email registrations; sign-in and recovery for existing accounts are not restricted.',
    close: 'Close',
  },
} as const;
