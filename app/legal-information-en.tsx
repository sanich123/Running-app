import { LANGUAGES } from '@const/enums';
import LegalIndexPage from '@Routes/legal-documents/legal-index-page/legal-index-page';

export default function LegalInformationEnglishScreen() {
  return <LegalIndexPage language={LANGUAGES.english} />;
}
