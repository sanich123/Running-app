import { Suspense } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { LazyProfilePage } from '@Routes/app-routes/const';
import ProfileHeaderToolbar from '@Routes/profile/profile-header-toolbar/profile-header-toolbar';
import FullPageActivityLoader from '@S/full-page-activity-loader/full-page-activity-loader';

export default function ProfileRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const profileUserId = Array.isArray(id) ? id[0] : id;

  return (
    <>
      <ProfileHeaderToolbar profileUserId={profileUserId} />
      <Suspense fallback={<FullPageActivityLoader />}>
        <LazyProfilePage />
      </Suspense>
    </>
  );
}
