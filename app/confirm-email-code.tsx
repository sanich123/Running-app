import { Suspense } from 'react';
import { LazyConfirmEmailCodePage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function ConfirmEmailCodeScreen() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyConfirmEmailCodePage />
    </Suspense>
  );
}
