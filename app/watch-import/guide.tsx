import { Suspense } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import WorkoutImportGuidePage from '@Routes/watch-import/workout-import-guide';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function WorkoutImportGuideRoute() {
  if (Platform.OS !== 'android') return null;

  return (
    <Suspense fallback={<FullPageActivityLoader />}>
      <Stack.Screen options={{ title: 'Импорт тренировок' }} />
      <WorkoutImportGuidePage />
    </Suspense>
  );
}
