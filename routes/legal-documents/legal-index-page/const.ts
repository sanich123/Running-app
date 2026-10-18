import { ROUTES } from '@const/enums';
import type { LegalDocumentId } from '../content';

export const DOCUMENTS: LegalDocumentId[] = ['agreement', 'consents', 'privacy', 'locationConsent', 'accountDeletion'];

export const DOCUMENT_PATHS: Record<LegalDocumentId, { russian: string; english: string }> = {
  privacy: { russian: `/${ROUTES.privacyPolicy}`, english: `/${ROUTES.privacyPolicyEnglish}` },
  consents: { russian: `/${ROUTES.consents}`, english: `/${ROUTES.consentsEnglish}` },
  agreement: { russian: `/${ROUTES.userAgreement}`, english: `/${ROUTES.userAgreementEnglish}` },
  locationConsent: { russian: `/${ROUTES.locationConsent}`, english: `/${ROUTES.locationConsentEnglish}` },
  accountDeletion: { russian: `/${ROUTES.accountDeletion}`, english: `/${ROUTES.accountDeletionEnglish}` },
};
