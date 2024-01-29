import AddDeleteFriendBtn from '@C/add-delete-friend-btn/add-delete-friend-btn';
import AvatarShowable from '@C/avatar-showable/avatar-showable';
import ErrorComponent from '@C/error-component/error-component';
import FollowersCount from '@C/followers-count/followers-count';
import FollowingCount from '@C/following-count/following-count';
import ProfileMediaPhotos from '@C/profile-media-photos/profile-media-photos';
import { saveBio, saveCity, saveGender, saveName, savePhotoUrl, saveSurname, saveWeight } from '@R/profile/profile';
import { runichApi, useGetUserProfileByIdQuery } from '@R/runich-api/runich-api';
import { useAuth } from 'auth/context/auth-context';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function Profile() {
  const { id: friendId } = useLocalSearchParams();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const isMineActivity = friendId === user?.id;
  const { isLoading, isSuccess, isError, data: profile, error } = useGetUserProfileByIdQuery(`${user?.id}`);

  const prefetchUserActivities = runichApi.usePrefetch('getActivitiesByUserId');
  useEffect(() => {
    prefetchUserActivities(`${user?.id}`);
  }, []);

  useEffect(() => {
    if (isSuccess) {
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
      {user && (
        <>
          <ProfileMediaPhotos userId={user.id} />
          <View style={[styles.container, (isLoading || isError) && styles.isInCenter]}>
            {isLoading && <ActivityIndicator size="large" />}
            {error ? <ErrorComponent error={error} /> : null}
            {isSuccess && (
              <>
                <View style={styles.header}>
                  <AvatarShowable size={100} id={user.id} />
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
                <View style={styles.followersWrapper}>
                  <FollowingCount />
                  <FollowersCount />
                  {!isMineActivity && friendId && <AddDeleteFriendBtn friendId={`${friendId}`} />}
                </View>
              </>
            )}
          </View>
        </>
      )}
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
  followersWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
});
