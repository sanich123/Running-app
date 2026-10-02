import { Suspense, useState } from 'react';
import { Stack } from 'expo-router';
import { LazyMapPage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function ActivityMapRoute() {
  const [isVideoExporting, setIsVideoExporting] = useState(false);

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerShadowVisible: false,
          headerTitle: '',
          headerRight: () => null,
          headerBackVisible: !isVideoExporting,
          headerBackTitle: '',
        }}
      />
      <Suspense fallback={<FullPageActivityLoader />}>
        <LazyMapPage onVideoExportStateChange={setIsVideoExporting} />
      </Suspense>
    </>
  );
}
