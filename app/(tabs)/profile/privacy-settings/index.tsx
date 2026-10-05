import { Suspense } from 'react';
import { LazyProfilePrivacySettingsPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function ProfilePrivacySettingsRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyProfilePrivacySettingsPage />
    </Suspense>
  );
}
