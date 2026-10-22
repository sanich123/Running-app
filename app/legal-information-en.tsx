import { Suspense } from 'react';
import { LANGUAGES } from '@const/enums';
import { LazyLegalIndexPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function LegalInformationEnglishScreen() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyLegalIndexPage language={LANGUAGES.english} />
    </Suspense>
  );
}
