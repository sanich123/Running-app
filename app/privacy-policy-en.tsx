import { Suspense } from 'react';
import { LANGUAGES } from '@const/enums';
import { LazyLegalDocumentPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function PrivacyPolicyEnglishScreen() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyLegalDocumentPage documentId="privacy" language={LANGUAGES.english} />
    </Suspense>
  );
}
