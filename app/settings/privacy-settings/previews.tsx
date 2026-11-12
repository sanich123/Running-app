import { Suspense } from 'react';
import { LazyProfilePrivacyPreviewsPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function ProfilePrivacyPreviewsRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyProfilePrivacyPreviewsPage />
    </Suspense>
  );
}
