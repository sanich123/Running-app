import { LANGUAGES } from '@const/enums';
import LegalDocumentPage from '@Routes/legal-documents/legal-document-page';

export default function LocationConsentScreen() {
  return <LegalDocumentPage documentId="locationConsent" language={LANGUAGES.russian} />;
}
