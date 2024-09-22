import AvatarShowable from '@C/avatar/showable/showable';
import ErrorComponent from '@C/error-component/error-component';
import ProfileMediaPhotos from '@C/profile/media-photos/media-photos';
import { saveBio, saveCity, saveGender, saveName, savePhotoUrl, saveSurname, saveWeight } from '@R/profile/profile';

import { useAppDispatch } from '@R/typed-hooks';
import { ROUTES } from '@const/enums';
import { useAuth } from 'auth/context/auth-context';
import { useLocalSearchParams, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

import FollowUnfollowBtn from './follow-unfollow-btn/follow-unfollow-btn';
import { USERS_VARIANT } from './users-counter/const';
import UsersCounter from './users-counter/users-counter';
import { useGetUserProfileByUserIdQuery } from '@R/runich-api/runich-api';
import ProfileStatistics from './statistics/profile-statistics';

export default function ProfilePage() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { id: whosProfileViewing } = useLocalSearchParams();
  const { user } = useAuth();
  const whosProfile = whosProfileViewing ? whosProfileViewing : user?.id;

  const {
    isLoading,
    isSuccess,
    isError,
    data: profile,
    error,
  } = useGetUserProfileByUserIdQuery(`${whosProfile}`, { skip: !whosProfile });

  const isProfilePage = !pathname.includes(ROUTES.home);

  useEffect(() => {
    if (isSuccess && isProfilePage) {
      if (profile) {
        dispatch(saveGender(profile?.gender));
        dispatch(saveName(profile?.name));
        dispatch(saveSurname(profile?.surname));
        dispatch(saveCity(profile?.city));
        dispatch(saveWeight(profile?.weight));
        dispatch(saveBio(profile?.bio));
        dispatch(savePhotoUrl(profile?.profilePhoto));
      }
    }
  }, [dispatch, isProfilePage, isSuccess, profile]);

  return (
    <>
      <ProfileMediaPhotos userId={`${whosProfile}`} />
      <View
        style={[styles.container, (isLoading || isError) && styles.isInCenter, { backgroundColor: colors.background }]}>
        {isLoading && <ActivityIndicator size="large" />}
        {error ? <ErrorComponent error={error} /> : null}
        {isSuccess ? (
          <>
            <View style={styles.header}>
              <AvatarShowable size={100} id={`${whosProfile}`} />
              <View style={styles.nicknameWrapper}>
                <Text variant="headlineMedium">
                  {profile?.name} {profile?.surname}
                </Text>
                <Text variant="titleLarge">{profile?.city} </Text>
              </View>
            </View>
            <View style={styles.bio}>
              <Text variant="titleMedium">{profile?.bio}</Text>
            </View>
            <View style={styles.followersBtnsWrapper}>
              <UsersCounter variant={USERS_VARIANT.whoUserFollows} />
              <UsersCounter variant={USERS_VARIANT.whoFollowsUser} />
              {whosProfile !== user?.id && <FollowUnfollowBtn friendId={`${whosProfileViewing}`} />}
            </View>
            <ProfileStatistics whosProfile={`${whosProfile}`} />
          </>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
  },
  isInCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 10,
  },
  nicknameWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  bio: {
    display: 'flex',
    marginTop: 20,
    marginBottom: 20,
  },
  followersBtnsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  statistics: {
    display: 'flex',
    borderWidth: 1,
    borderRadius: 55,
    height: 110,
    width: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
