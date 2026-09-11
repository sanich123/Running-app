import { LANGUAGES } from '@const/enums';
import LegalDocumentPage from '@Routes/legal-documents/legal-document-page';

export default function UserAgreementEnglishScreen() {
  return <LegalDocumentPage documentId="agreement" language={LANGUAGES.english} />;
}
