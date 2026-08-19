import { Platform, ScrollView, useWindowDimensions, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { FONT_FAMILIES } from '@const/fonts';
import { useGetAllActivityPhotosByUserIdQuery } from '@R/services/activity/activity';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import ProfileMediaPhotos from '@Routes/profile/media-photos/media-photos';
import AvatarShowable from '@S/avatar/showable/showable';
import ErrorComponent from '@S/error-component/error-component';
import FollowUnfollowBtn from '@S/user-list-item/follow-unfollow-btn/follow-unfollow-btn';
import ProfileStatistics from './statistics/profile-statistics';
import { USERS_VARIANT } from './users-counter/const';
import UsersCounter from './users-counter/users-counter';

export default function ProfilePage() {
  const { width } = useWindowDimensions();
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
  const { data: photoPreviews } = useGetAllActivityPhotosByUserIdQuery({ userId, take: 4 }, { skip: !userId });

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.container,
          {
            backgroundColor: colors.background,
            width: width < MAX_MOBILE_WIDTH ? '100%' : MAX_MOBILE_WIDTH,
            marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
          },
          (isLoading || isError) && styles.isInCenter,
        ]}>
        {isLoading ? (
          <ActivityIndicator size="large" testID="profile-page-loading" />
        ) : isSuccess ? (
          <>
            {photoPreviews?.photos?.length ? (
              <View style={styles.mediaPhotosWrapper}>
                <ProfileMediaPhotos userId={`${whosProfile}`} />
              </View>
            ) : null}

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
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
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
