import { Suspense } from 'react';
import { Stack } from 'expo-router';
import WatchImportPage from '@Routes/watch-import/watch-import';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function WatchImportRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <Stack.Screen options={{ title: '' }} />
      <WatchImportPage />
    </Suspense>
  );
}
