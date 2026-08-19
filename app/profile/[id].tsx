import { Suspense } from 'react';
import { LazyProfilePage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function ProfileRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyProfilePage />
    </Suspense>
  );
}
