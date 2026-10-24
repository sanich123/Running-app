import { Suspense } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { LABELS } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { LazyProfilePage } from '@Routes/app-routes/const';
import ProfileHeaderActions from '@Routes/profile/profile-header-actions/profile-header-actions';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function ProfileRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const profileUserId = Array.isArray(id) ? id[0] : id;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <ProfileHeaderActions profileUserId={profileUserId} currentUserId={userId} />,
          headerTitle: LABELS[language].profile,
          title: LABELS[language].profile,
        }}
      />
      <Suspense fallback={<FullPageActivityLoader />}>
        <LazyProfilePage />
      </Suspense>
    </>
  );
}
