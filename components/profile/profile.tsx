import AvatarShowable from '@C/avatar/showable/showable';
import ErrorComponent from '@C/error-component/error-component';
import ProfileMediaPhotos from '@C/profile/media-photos/media-photos';
import { saveBio, saveCity, saveGender, saveName, savePhotoUrl, saveSurname, saveWeight } from '@R/profile/profile';
import { runichApi, useGetUserProfileByIdQuery } from '@R/runich-api/runich-api';
import { useAppDispatch } from '@R/typed-hooks';
import { useAuth } from 'auth/context/auth-context';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import FollowUnfollowBtn from './follow-unfollow-btn/follow-unfollow-btn';
import { USERS_VARIANT } from './users-counter/const';
import UsersCounter from './users-counter/users-counter';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { id: whosProfileViewing } = useLocalSearchParams();
  const { user } = useAuth();
  const whosProfile = whosProfileViewing ? whosProfileViewing : user?.id;
  const isMeViewing = whosProfileViewing === user?.id;
  const {
    isLoading,
    isSuccess,
    isError,
    data: profile,
    error,
  } = useGetUserProfileByIdQuery(`${whosProfile}`, { skip: !whosProfile });

  const prefetchUserActivities = runichApi.usePrefetch('getActivitiesByUserId');

  useEffect(() => {
    if (isMeViewing) {
      prefetchUserActivities({ id: `${user?.id}`, page: 0, take: 10 });
    }
  }, []);

  useEffect(() => {
    if (isSuccess && isMeViewing) {
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
  }, [profile]);

  return (
    <>
      <ProfileMediaPhotos userId={`${whosProfile}`} />
      <View style={[styles.container, (isLoading || isError) && styles.isInCenter]}>
        {isLoading && <ActivityIndicator size="large" />}
        {error ? <ErrorComponent error={error} /> : null}
        {isSuccess && (
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
              {!isMeViewing && whosProfileViewing && <FollowUnfollowBtn friendId={`${whosProfileViewing}`} />}
            </View>
          </>
        )}
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
});
