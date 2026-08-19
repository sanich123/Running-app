import { Suspense } from 'react';
import { LazyCommentFullViewPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function CommentRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyCommentFullViewPage />
    </Suspense>
  );
}
