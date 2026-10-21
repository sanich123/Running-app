import { LANGUAGES } from '@const/enums';
import LegalDocumentPage from '@Routes/legal-documents/legal-document-page/legal-document-page';

export default function ConsentsEnglishScreen() {
  return <LegalDocumentPage documentId="consents" language={LANGUAGES.english} />;
}
