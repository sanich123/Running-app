import { LANGUAGES } from '@const/enums';

export const LEGAL_OPERATOR = {
  name: 'Воронин Александр Олегович',
  statusRussian:
    'физическое лицо, применяющее специальный налоговый режим «Налог на профессиональный доход» (самозанятый)',
  statusEnglish: 'individual applying the Russian special tax regime for professional income (self-employed)',
  countryRussian: 'Российская Федерация',
  countryEnglish: 'Russian Federation',
  inn: '343803304189',
  addressRussian: 'Российская Федерация, г. Москва, ул. Айвазовского, д. 6, к. 1',
  addressEnglish: 'Russian Federation, Moscow, 6 Ayvazovskogo St., Building 1',
  email: 'aovoronin.piano@gmail.com',
} as const;

export const LEGAL_DOCUMENT_VERSION = {
  russian: '21 октября 2026 г. Версия 1.5',
  english: 'October 21, 2026. Version 1.5',
} as const;

export type LegalDocumentId = 'privacy' | 'consents' | 'agreement' | 'locationConsent' | 'accountDeletion';

export const LEGAL_DOCUMENT_LABELS = {
  [LANGUAGES.russian]: {
    privacy: 'Политика в отношении обработки персональных данных',
    agreement: 'Пользовательское соглашение',
    consents: 'Согласие на обработку персональных данных',
    locationConsent: 'Согласие на обработку данных геолокации',
    accountDeletion: 'Удаление аккаунта',
    legalInformation: 'Юридическая информация',
  },
  [LANGUAGES.english]: {
    privacy: 'Personal Data Processing Policy',
    agreement: 'User Agreement',
    consents: 'Consent to Personal Data Processing',
    locationConsent: 'Location Consent',
    accountDeletion: 'Account Deletion',
    legalInformation: 'Legal Information',
  },
} as const;
