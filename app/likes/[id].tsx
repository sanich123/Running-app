import { Suspense } from 'react';
import { LazyLikesList } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function LikesRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <LazyLikesList />
    </Suspense>
  );
}
