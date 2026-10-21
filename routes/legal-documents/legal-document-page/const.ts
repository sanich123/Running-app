import { ROUTES } from '@const/enums';
import type { LegalDocumentId } from '../content';

export const RELATED_DOCUMENTS: Record<LegalDocumentId, LegalDocumentId[]> = {
  privacy: ['agreement', 'consents', 'locationConsent', 'accountDeletion'],
  consents: ['agreement', 'privacy', 'locationConsent', 'accountDeletion'],
  agreement: ['consents', 'privacy', 'locationConsent', 'accountDeletion'],
  locationConsent: ['agreement', 'consents', 'privacy', 'accountDeletion'],
  accountDeletion: ['agreement', 'consents', 'privacy', 'locationConsent'],
};

export const DOCUMENT_PATHS: Record<LegalDocumentId, { russian: string; english: string }> = {
  privacy: { russian: `/${ROUTES.privacyPolicy}`, english: `/${ROUTES.privacyPolicyEnglish}` },
  consents: { russian: `/${ROUTES.consents}`, english: `/${ROUTES.consentsEnglish}` },
  agreement: { russian: `/${ROUTES.userAgreement}`, english: `/${ROUTES.userAgreementEnglish}` },
  locationConsent: { russian: `/${ROUTES.locationConsent}`, english: `/${ROUTES.locationConsentEnglish}` },
  accountDeletion: { russian: `/${ROUTES.accountDeletion}`, english: `/${ROUTES.accountDeletionEnglish}` },
};
