import type { LegalDocumentId } from '../content';
import type { LANGUAGES } from '@const/enums';

export interface LegalDocumentPageProps {
  documentId: LegalDocumentId;
  language: LANGUAGES;
}
