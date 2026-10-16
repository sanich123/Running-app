import { Suspense } from 'react';
import { Stack } from 'expo-router';
import { useAppSelector } from '@R/typed-hooks';
import { LazyProfileEditBtn, LazyProfilePage } from '@Routes/app-routes/const';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function ProfileIndexPage() {
  const { userId } = useAppSelector(({ auth }) => auth);
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () =>
            userId ? (
              <Suspense fallback={null}>
                <LazyProfileEditBtn />
              </Suspense>
            ) : null,
        }}
      />
      <Suspense fallback={<FullPageActivityLoader />}>
        <LazyProfilePage />
      </Suspense>
    </>
  );
}
