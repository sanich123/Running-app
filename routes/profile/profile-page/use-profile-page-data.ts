import { Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGetAllActivityMediaByUserIdInfiniteQuery } from '@R/services/activity/activity';
import { useGetFollowersByUserIdQuery, useGetYouFollowUsersByUserIdQuery } from '@R/services/followers/followers';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useGetAllTimeStatisticsByUserIdQuery } from '@R/services/statistics/statistics';
import { useAppSelector } from '@R/typed-hooks';

export default function useProfilePageData() {
  const { id: profileIdFromRoute } = useLocalSearchParams();
  const { userId } = useAppSelector(({ auth }) => auth);
  const requestedProfileId = profileIdFromRoute || userId;
  const profileUserId = `${requestedProfileId}`;
  const isOwnProfile = profileUserId === userId;
  const {
    isLoading,
    isSuccess,
    isError,
    data: profile,
    error,
    refetch,
  } = useGetUserProfileByUserIdQuery(profileUserId, { skip: !requestedProfileId });
  const profileResolved = isSuccess && Boolean(profile);
  const canViewProfilePhotos = isOwnProfile || profile?.hideProfilePhotos !== true;
  const canViewFollowLists = isOwnProfile || profile?.hideFollowingList !== true;
  const canViewStatistics = isOwnProfile || profile?.hideActivityStatistics !== true;
  const shouldLoadMedia = profileResolved && canViewProfilePhotos;
  const shouldLoadFollowLists = profileResolved && canViewFollowLists;
  const shouldLoadStatistics = profileResolved && canViewStatistics;

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
  const hasPendingContentQuery = [
    shouldLoadMedia && !mediaQuery.isSuccess && !mediaQuery.isError,
    shouldLoadFollowLists && !followingQuery.isSuccess && !followingQuery.isError,
    shouldLoadFollowLists && !followersQuery.isSuccess && !followersQuery.isError,
    shouldLoadStatistics && !statisticsQuery.isSuccess && !statisticsQuery.isError,
  ].some(Boolean);
  const isContentLoading = isLoading || (profileResolved && hasPendingContentQuery);
  const canEditProfile = isOwnProfile && Boolean(userId);

  return {
    profileUserId,
    profile,
    profileError: isError ? (error ?? null) : null,
    refetch,
    isContentLoading,
    isSuccess,
    shouldShowProfilePhotos: !isContentLoading && isSuccess && canViewProfilePhotos,
    shouldShowCommunitySection: canViewFollowLists,
    shouldShowFollowAction: !isOwnProfile && profile?.allowNewFollowers !== false,
    shouldShowStatistics: canViewStatistics,
    shouldShowWatchImport: Platform.OS === 'android' && canEditProfile,
    shouldShowPrivacySettings: canEditProfile,
  };
}
