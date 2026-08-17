import { lazy, Suspense } from 'react';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

const LazyCommentFullViewPage = lazy(() => import('@Routes/comment-page/comment-page'));

export default function CommentRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyCommentFullViewPage />
    </Suspense>
  );
}
