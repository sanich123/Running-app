import { LANGUAGES } from '@const/enums';
import LegalDocumentPage from '@Routes/legal-documents/legal-document-page';

export default function AccountDeletionScreen() {
  return <LegalDocumentPage documentId="accountDeletion" language={LANGUAGES.russian} />;
}
