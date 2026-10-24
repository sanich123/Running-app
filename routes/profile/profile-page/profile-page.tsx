import { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, useWindowDimensions, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconButton, List, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useGetAllActivityMediaByUserIdInfiniteQuery } from '@R/services/activity/activity';
import { useGetFollowersByUserIdQuery, useGetYouFollowUsersByUserIdQuery } from '@R/services/followers/followers';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useGetAllTimeStatisticsByUserIdQuery } from '@R/services/statistics/statistics';
import { useAppSelector } from '@R/typed-hooks';
import ProfileMediaPhotos from '@Routes/profile/media-photos/profile-media-photos/profile-media-photos';
import AvatarShowable from '@S/avatar/showable/avatar-showable/avatar-showable';
import CustomImage from '@S/custom-image/custom-image';
import ErrorComponent from '@S/error-component/error-component';
import FollowUnfollowBtn from '@S/user-list-item/follow-unfollow-btn/follow-unfollow-btn';
import { PROFILE_SECTIONS, PROFILE_WATCH_IMPORT } from '../const';
import { PROFILE_PRIVACY_LINK_LABELS } from './const';
import ProfileSkeleton from '../profile-skeleton/profile-skeleton';
import ProfileStatistics from '../statistics/profile-statistics/profile-statistics';
import { USERS_VARIANT } from '../users-counter/const';
import UsersCounter from '../users-counter/users-counter';

export default function ProfilePage() {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { push } = useRouter();
  const { id: whosProfileViewing } = useLocalSearchParams();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const [isProfilePhotoVisible, setIsProfilePhotoVisible] = useState(false);
  const whosProfile = whosProfileViewing ? whosProfileViewing : userId;
  const profileUserId = `${whosProfile}`;
  const isOwnProfile = String(whosProfile) === userId;

  const {
    isLoading,
    isSuccess,
    isError,
    data: profile,
    error,
    refetch,
  } = useGetUserProfileByUserIdQuery(profileUserId, { skip: !whosProfile });
  const areFollowListsHidden = !isOwnProfile && profile?.hideFollowingList === true;
  const profileResolved = isSuccess && Boolean(profile);
  const shouldLoadMedia = profileResolved && (isOwnProfile || profile?.hideProfilePhotos !== true);
  const shouldLoadFollowLists = profileResolved && !areFollowListsHidden;
  const shouldLoadStatistics = profileResolved && (isOwnProfile || profile?.hideActivityStatistics !== true);
  const mediaQuery = useGetAllActivityMediaByUserIdInfiniteQuery(
    { userId: profileUserId, take: 4 },
    { skip: !shouldLoadMedia },
  );
  const followingQuery = useGetYouFollowUsersByUserIdQuery(profileUserId, { skip: !shouldLoadFollowLists });
  const followersQuery = useGetFollowersByUserIdQuery(profileUserId, { skip: !shouldLoadFollowLists });
  const statisticsQuery = useGetAllTimeStatisticsByUserIdQuery(
    { userId: profileUserId },
    { skip: !shouldLoadStatistics },
  );
  const isContentLoading =
    isLoading ||
    (profileResolved &&
      ((shouldLoadMedia && !mediaQuery.isSuccess && !mediaQuery.isError) ||
        (shouldLoadFollowLists &&
          ((!followingQuery.isSuccess && !followingQuery.isError) ||
            (!followersQuery.isSuccess && !followersQuery.isError))) ||
        (shouldLoadStatistics && !statisticsQuery.isSuccess && !statisticsQuery.isError)));
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
          isError && styles.isInCenter,
        ]}>
        {!isContentLoading && isSuccess && (isOwnProfile || profile?.hideProfilePhotos !== true) && (
          <View style={styles.mediaPhotosWrapper}>
            <ProfileMediaPhotos userId={profileUserId} />
          </View>
        )}
        {isContentLoading ? (
          <ProfileSkeleton />
        ) : isSuccess ? (
          <>
            <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <TouchableRipple
                testID="profile-avatar-open-button"
                borderless
                disabled={!profile?.profilePhoto}
                onPress={() => setIsProfilePhotoVisible(true)}
                style={[styles.avatarRing, { borderColor: colors.primary }]}>
                <AvatarShowable size={92} id={`${whosProfile}`} profile={profile ?? undefined} />
              </TouchableRipple>
              <View style={styles.nicknameWrapper}>
                <Text variant="titleLarge" numberOfLines={2} ellipsizeMode="tail" style={styles.profileName}>
                  {profile?.name} {profile?.surname}
                </Text>
                <Text
                  variant="bodyMedium"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ color: colors.onSurfaceVariant }}>
                  {profile?.city}
                </Text>
              </View>
            </View>
            <View style={[styles.bio, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <Text variant="titleMedium" style={{ color: colors.primary, fontFamily: FONT_FAMILIES.semiBold }}>
                {PROFILE_SECTIONS[language].about}
              </Text>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                {profile?.bio || '—'}
              </Text>
            </View>
            {(isOwnProfile || !areFollowListsHidden) && (
              <View style={styles.followersBtnsWrapper} testID="profile-community-section">
                <UsersCounter variant={USERS_VARIANT.whoUserFollows} />
                <UsersCounter variant={USERS_VARIANT.whoFollowsUser} />
              </View>
            )}
            {!isOwnProfile && profile?.allowNewFollowers !== false && (
              <View style={styles.followAction}>
                <FollowUnfollowBtn friendId={`${whosProfile}`} />
              </View>
            )}
            {isOwnProfile || profile?.hideActivityStatistics !== true ? (
              <ProfileStatistics whosProfile={`${whosProfile}`} />
            ) : null}
            {Platform.OS === 'android' && isOwnProfile && userId ? (
              <List.Item
                testID="watch-import-profile-row"
                title={PROFILE_WATCH_IMPORT[language].title}
                titleNumberOfLines={1}
                description={PROFILE_WATCH_IMPORT[language].subtitle}
                descriptionNumberOfLines={1}
                left={(props) => <List.Icon {...props} icon="watch-variant" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => push(`/${ROUTES.watchImport}` as Parameters<typeof push>[0])}
                style={[
                  styles.privacySettingsLink,
                  { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
                ]}
              />
            ) : null}
            {isOwnProfile && userId ? (
              <List.Item
                testID="profile-privacy-settings-button"
                title={PROFILE_PRIVACY_LINK_LABELS[language]}
                titleNumberOfLines={1}
                left={(props) => <List.Icon {...props} icon="shield-lock-outline" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => push(`/${ROUTES.profile}/${ROUTES.profilePrivacySettings}`)}
                style={[
                  styles.privacySettingsLink,
                  { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
                ]}
              />
            ) : null}
          </>
        ) : isError ? (
          <ErrorComponent error={error} refetch={refetch} />
        ) : null}
      </ScrollView>
      <Modal
        visible={isProfilePhotoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsProfilePhotoVisible(false)}>
        <View style={styles.photoModal}>
          <Pressable
            testID="profile-photo-modal-backdrop"
            style={StyleSheet.absoluteFill}
            onPress={() => setIsProfilePhotoVisible(false)}
          />
          <View style={styles.photoModalContent}>
            <CustomImage
              testID="profile-photo-modal-image"
              source={{ uri: profile?.profilePhoto }}
              contentFit="contain"
              placeholder={profile?.profilePhotoBlurhash}
              style={styles.photoModalImage}
            />
            <IconButton
              testID="profile-photo-modal-close"
              icon="close"
              iconColor="#FFFFFF"
              size={28}
              onPress={() => setIsProfilePhotoVisible(false)}
              style={styles.photoModalClose}
            />
          </View>
        </View>
      </Modal>
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
    borderRadius: 20,
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    columnGap: 16,
    marginBottom: 12,
    padding: 20,
  },
  avatarRing: {
    borderRadius: 56,
    borderWidth: 2,
    padding: 3,
  },
  nicknameWrapper: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  bio: {
    borderRadius: 16,
    borderWidth: 1,
    display: 'flex',
    gap: 8,
    marginBottom: 12,
    padding: 16,
  },
  followersBtnsWrapper: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  followAction: {
    alignSelf: 'stretch',
    marginBottom: 12,
  },
  profileName: { fontFamily: FONT_FAMILIES.extraBold },
  privacySettingsLink: {
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  photoModal: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  photoModalContent: {
    alignItems: 'center',
    height: '80%',
    justifyContent: 'center',
    width: '100%',
  },
  photoModalImage: {
    height: '100%',
    width: '100%',
  },
  photoModalClose: {
    position: 'absolute',
    right: 0,
    top: 0,
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
