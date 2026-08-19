import { Suspense } from 'react';
import { LazyLegalInformation } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function LegalInformationScreen() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyLegalInformation />
    </Suspense>
  );
}
