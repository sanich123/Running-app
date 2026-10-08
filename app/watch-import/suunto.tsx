import { Suspense } from 'react';
import { Stack } from 'expo-router';
import SuuntoWatchImportPage from '@Routes/watch-import/suunto-guide';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function SuuntoWatchImportRoute() {
  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <Stack.Screen options={{ title: 'Suunto' }} />
      <SuuntoWatchImportPage />
    </Suspense>
  );
}
