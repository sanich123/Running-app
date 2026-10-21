import { ROUTES } from '@const/enums';
import type { LegalDocumentId } from '@Routes/legal-documents/content';

export const DOCUMENTS: { id: LegalDocumentId; route: ROUTES; englishRoute: ROUTES }[] = [
  { id: 'agreement', route: ROUTES.userAgreement, englishRoute: ROUTES.userAgreementEnglish },
  { id: 'consents', route: ROUTES.consents, englishRoute: ROUTES.consentsEnglish },
  { id: 'privacy', route: ROUTES.privacyPolicy, englishRoute: ROUTES.privacyPolicyEnglish },
];
