import { LANGUAGES } from '@const/enums';
import LegalDocumentPage from '@Routes/legal-documents/legal-document-page';

export default function PrivacyPolicyPage() {
  return <LegalDocumentPage documentId="privacy" language={LANGUAGES.russian} />;
}
