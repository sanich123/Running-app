import { lazy, Suspense } from 'react';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazyMigrationFromStrava = lazy(() => import('@Routes/migration-from-strava/migration-from-strava'));

export default function Migration() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyMigrationFromStrava />
    </Suspense>
  );
}
