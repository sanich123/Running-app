import { Suspense } from 'react';
import { LANGUAGES } from '@const/enums';
import { LazyLegalDocumentPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function LocationConsentEnglishScreen() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyLegalDocumentPage documentId="locationConsent" language={LANGUAGES.english} />
    </Suspense>
  );
}
