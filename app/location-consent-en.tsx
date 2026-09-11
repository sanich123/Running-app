import { LANGUAGES } from '@const/enums';
import LegalDocumentPage from '@Routes/legal-documents/legal-document-page';

export default function LocationConsentEnglishScreen() {
  return <LegalDocumentPage documentId="locationConsent" language={LANGUAGES.english} />;
}
