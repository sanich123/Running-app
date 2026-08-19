import { Suspense } from 'react';
import { LazyMigrationFromStrava } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function Migration() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyMigrationFromStrava />
    </Suspense>
  );
}
