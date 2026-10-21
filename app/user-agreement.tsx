import { LANGUAGES } from '@const/enums';
import LegalDocumentPage from '@Routes/legal-documents/legal-document-page/legal-document-page';

export default function UserAgreementScreen() {
  return <LegalDocumentPage documentId="agreement" language={LANGUAGES.russian} />;
}
