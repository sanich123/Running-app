import { useEffect } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useLocalSearchParams, usePathname } from 'expo-router';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import {
  saveBio,
  saveCity,
  saveGender,
  saveName,
  savePhotoUrl,
  saveSurname,
  saveWeight,
} from '@R/slices/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import AvatarShowable from '@Routes/avatar/showable/showable';
import ErrorComponent from '@Routes/error-component/error-component';
import ProfileMediaPhotos from '@Routes/profile/media-photos/media-photos';
import FollowUnfollowBtn from './follow-unfollow-btn/follow-unfollow-btn';
import ProfileStatistics from './statistics/profile-statistics';
import { USERS_VARIANT } from './users-counter/const';
import UsersCounter from './users-counter/users-counter';

export default function ProfilePage() {
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { id: whosProfileViewing } = useLocalSearchParams();
  const { userId } = useAppSelector(({ auth }) => auth);
  const whosProfile = whosProfileViewing ? whosProfileViewing : userId;

  const {
    isLoading,
    isSuccess,
    isError,
    data: profile,
    error,
    refetch,
  } = useGetUserProfileByUserIdQuery(`${whosProfile}`, { skip: !whosProfile });

  const isProfilePage = !pathname.includes(ROUTES.home);

  useEffect(() => {
    if (isSuccess && isProfilePage && profile?.user_id === userId) {
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
  }, [dispatch, isProfilePage, isSuccess, profile, userId]);

  return (
    <>
      <View
        style={[
          styles.container,
          (isLoading || isError) && styles.isInCenter,
          {
            backgroundColor: colors.background,
            width: width < MAX_MOBILE_WIDTH ? 'auto' : MAX_MOBILE_WIDTH,
            marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
          },
        ]}>
        {isLoading ? (
          <ActivityIndicator size="large" testID="profile-page-loading" />
        ) : isSuccess ? (
          <>
            <View style={styles.mediaPhotosWrapper}>
              <ProfileMediaPhotos userId={`${whosProfile}`} />
            </View>
            <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <View style={[styles.avatarRing, { borderColor: colors.primary }]}>
                <AvatarShowable size={92} id={`${whosProfile}`} />
              </View>
              <View style={styles.nicknameWrapper}>
                <Text variant="titleLarge" style={styles.profileName}>
                  {profile?.name} {profile?.surname}
                </Text>
                <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                  {profile?.city}
                </Text>
              </View>
            </View>
            <View style={[styles.bio, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <Text variant="labelMedium" style={{ color: colors.primary, fontFamily: FONT_FAMILIES.semiBold }}>
                ABOUT
              </Text>
              <Text variant="bodyMedium">{profile?.bio}</Text>
            </View>
            <View style={styles.followersBtnsWrapper}>
              <UsersCounter variant={USERS_VARIANT.whoUserFollows} />
              <UsersCounter variant={USERS_VARIANT.whoFollowsUser} />
              {whosProfile !== userId && <FollowUnfollowBtn friendId={`${whosProfile}`} />}
            </View>
            <ProfileStatistics whosProfile={`${whosProfile}`} />
          </>
        ) : isError ? (
          <ErrorComponent error={error} refetch={refetch} />
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  mediaPhotosWrapper: {
    alignSelf: 'stretch',
    marginHorizontal: -12,
    marginBottom: 10,
    marginTop: -16,
  },
  isInCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    columnGap: 16,
    padding: 16,
  },
  avatarRing: {
    borderRadius: 52,
    borderWidth: 2,
    padding: 3,
  },
  nicknameWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  bio: {
    borderRadius: 8,
    borderWidth: 1,
    display: 'flex',
    gap: 8,
    marginVertical: 12,
    padding: 16,
  },
  followersBtnsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  profileName: { fontFamily: FONT_FAMILIES.extraBold },
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
