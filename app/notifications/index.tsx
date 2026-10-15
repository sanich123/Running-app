import { Suspense } from 'react';
import { LazyNotificationsPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function NotificationsRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyNotificationsPage />
    </Suspense>
  );
}
