import { LANGUAGES } from '@const/enums';
import LegalDocumentPage from '@Routes/legal-documents/legal-document-page/legal-document-page';

export default function AccountDeletionEnglishScreen() {
  return <LegalDocumentPage documentId="accountDeletion" language={LANGUAGES.english} />;
}
