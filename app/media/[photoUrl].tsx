import { lazy, Suspense } from 'react';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazyPhotoViewer = lazy(() => import('@Routes/photo-viewer/photo-viewer'));

export default function PhotoViewerRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyPhotoViewer />
    </Suspense>
  );
}
