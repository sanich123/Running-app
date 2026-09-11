import { LANGUAGES } from '@const/enums';
import LegalIndexPage from '@Routes/legal-documents/legal-index-page';

export default function LegalInformationPage() {
  return <LegalIndexPage language={LANGUAGES.russian} />;
}
