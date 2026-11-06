import { LANGUAGES } from '@const/enums';

export const LEGAL_CONSENTS_COPY = {
  [LANGUAGES.russian]: {
    agreementAccessibilityLabel: 'Принимаю пользовательское соглашение и политику обработки персональных данных',
    agreementPrefix: 'Я принимаю условия ',
    agreementLink: 'Пользовательского соглашения',
    agreementConnector: ' и ознакомлен(а) с ',
    privacyPolicyLink: 'Политикой в отношении обработки персональных данных',
    personalDataAccessibilityLabel: 'Согласен на обработку персональных данных',
    personalDataPrefix: 'Я выражаю свое ',
    personalDataLink: 'согласие на обработку',
    personalDataSuffix: ' моих персональных данных',
  },
  [LANGUAGES.english]: {
    agreementAccessibilityLabel: 'I accept the User Agreement and Personal Data Processing Policy',
    agreementPrefix: 'I accept the ',
    agreementLink: 'User Agreement',
    agreementConnector: ' and have read the ',
    privacyPolicyLink: 'Personal Data Processing Policy',
    personalDataAccessibilityLabel: 'I consent to personal data processing',
    personalDataPrefix: 'I give my ',
    personalDataLink: 'consent to the processing',
    personalDataSuffix: ' of my personal data',
  },
} as const;
