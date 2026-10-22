import { Suspense } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { LazyWatchImportPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function WatchImportRoute() {
  if (Platform.OS !== 'android') return null;

  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <Stack.Screen options={{ title: '' }} />
      <LazyWatchImportPage />
    </Suspense>
  );
}
