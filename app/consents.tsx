import { LANGUAGES } from '@const/enums';
import LegalDocumentPage from '@Routes/legal-documents/legal-document-page';

export default function ConsentsScreen() {
  return <LegalDocumentPage documentId="consents" language={LANGUAGES.russian} />;
}
