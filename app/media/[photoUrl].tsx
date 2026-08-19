import { Suspense } from 'react';
import { LazyPhotoViewer } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function PhotoViewerRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyPhotoViewer />
    </Suspense>
  );
}
