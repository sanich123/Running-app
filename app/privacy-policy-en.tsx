import { LANGUAGES } from '@const/enums';
import LegalDocumentPage from '@Routes/legal-documents/legal-document-page';

export default function PrivacyPolicyEnglishScreen() {
  return <LegalDocumentPage documentId="privacy" language={LANGUAGES.english} />;
}
