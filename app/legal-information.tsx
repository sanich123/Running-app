import { lazy, Suspense } from 'react';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazyLegalInformation = lazy(() => import('@Routes/legal-information/legal-information'));

export default function LegalInformationScreen() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyLegalInformation />
    </Suspense>
  );
}
