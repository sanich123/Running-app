import { Suspense } from 'react';
import { LazyChangePassword } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function ChangePasswordScreen() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyChangePassword />
    </Suspense>
  );
}
