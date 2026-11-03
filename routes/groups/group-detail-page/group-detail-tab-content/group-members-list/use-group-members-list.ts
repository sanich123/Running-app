import { useRouter } from 'expo-router';
import {
  useGetGroupMembersInfiniteQuery,
  useUpdateGroupMemberMutation,
  useUpdateGroupPreferencesMutation,
} from '@R/services/groups/groups';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { GROUPS_COPY } from '../../../const';
import { createGroupListScrollHandler } from '../utils';
import type { GroupDetails } from '@R/services/groups/types';

export default function useGroupMembersList(group: GroupDetails) {
  const { id, privacy, currentMembership, canManage, isOwner: groupIsOwner, createdByUserId } = group;
  const router = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { saveError } = GROUPS_COPY[language];
  const isOwner = groupIsOwner || createdByUserId === userId;
  const canManageGroup = canManage || isOwner;
  const canSeeMembers = privacy === 'open' || currentMembership?.status === 'active' || isOwner;
  const membership = currentMembership;
  const { data, isLoading, isError, error, refetch, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGetGroupMembersInfiniteQuery({ groupId: id, status: 'active' }, { skip: !canSeeMembers });
  const members = data?.pages.flatMap(({ items }) => items) ?? [];
  const [updateMember, { isLoading: isUpdatingMember }] = useUpdateGroupMemberMutation();
  const [updatePreferences, { isLoading: isUpdatingPreferences }] = useUpdateGroupPreferencesMutation();
  const onScroll = createGroupListScrollHandler({ hasNextPage, isFetchingNextPage, fetchNextPage });
  const openProfile = (profileId: string) => router.push(`/profile/${profileId}` as never);
  const changeMember = async (memberId: string, status: 'active' | 'rejected' | 'removed') => {
    try {
      await updateMember({ groupId: id, userId: memberId, status }).unwrap();
    } catch (updateError) {
      errorToast(saveError, updateError);
    }
  };
  const changePreferences = async (preference: 'notificationPreference' | 'feedPreference', value: string) => {
    if (!membership) return;
    const notificationPreference =
      preference === 'notificationPreference'
        ? value === 'all' || value === 'announcements' || value === 'off'
          ? value
          : null
        : (membership.notificationPreference ?? 'all');
    const feedPreference =
      preference === 'feedPreference'
        ? value === 'all' || value === 'admins'
          ? value
          : null
        : (membership.feedPreference ?? 'all');
    if (!notificationPreference || !feedPreference) return;
    try {
      await updatePreferences({
        groupId: id,
        notificationPreference,
        feedPreference,
      }).unwrap();
    } catch (updateError) {
      errorToast(saveError, updateError);
    }
  };

  return {
    canManageGroup,
    canSeeMembers,
    changeMember,
    changePreferences,
    copy: GROUPS_COPY[language],
    error,
    isError,
    isLoading,
    isUpdatingMember,
    isUpdatingPreferences,
    language,
    members,
    membership,
    onScroll,
    openProfile,
    refetch,
  };
}
