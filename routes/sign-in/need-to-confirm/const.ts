import { EMAIL_DELIVERY_NOTICE } from '@const/email-delivery';
import { LANGUAGES } from '@const/enums';

export const CHECK_EMAIL = {
  [LANGUAGES.english]: {
    mailHasBeenSent: 'An email with a link has been sent to your email address',
    needToCheckEmail: 'To confirm your email address, follow the link in the email.',
    spam: EMAIL_DELIVERY_NOTICE[LANGUAGES.english],
  },
  [LANGUAGES.russian]: {
    mailHasBeenSent: 'На указанный Вами адрес электронной почты отправлено письмо со cсылкой.',
    needToCheckEmail: 'Чтобы подтвердить свой адрес электронной почты, перейдите по ссылке в письме.',
    spam: EMAIL_DELIVERY_NOTICE[LANGUAGES.russian],
  },
} as const;
