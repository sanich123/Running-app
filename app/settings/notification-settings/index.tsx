import { Suspense } from 'react';
import { LazyNotificationSettingsPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function NotificationSettingsRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyNotificationSettingsPage />
    </Suspense>
  );
}
