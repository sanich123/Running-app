import { useCallback } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useGetGroupByIdQuery, useGetGroupsQuery, useJoinGroupMutation } from '@R/services/groups/groups';
import { useAppSelector } from '@R/typed-hooks';
import useFocusedAppPolling from '@U/hooks/use-focused-app-polling';
import { GROUPS_COPY } from '../const';

export default function useGroupDetailPage() {
  const { groupId: rawGroupId } = useLocalSearchParams<{ groupId: string }>();
  const groupId = Array.isArray(rawGroupId) ? rawGroupId[0] : rawGroupId;
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const copy = GROUPS_COPY[language];
  const {
    data: group,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetGroupByIdQuery(groupId ?? '', {
    skip: !groupId,
    refetchOnMountOrArgChange: true,
  });
  const [, { data: joinResult }] = useJoinGroupMutation({
    fixedCacheKey: `group-join-${groupId ?? 'unresolved'}`,
  });
  const hasUnknownOpenMembership = Boolean(group?.privacy === 'open' && group.currentMembership === null);
  const { data: myGroups = [], isLoading: isLoadingMyGroups } = useGetGroupsQuery(
    { scope: 'mine' },
    { skip: !hasUnknownOpenMembership || joinResult?.id === group?.id },
  );

  useFocusEffect(
    useCallback(() => {
      if (groupId) void refetch();
    }, [groupId, refetch]),
  );

  useFocusedAppPolling(Boolean(group?.photoPending), 8000, () => void refetch());

  const isOwner = Boolean(group && (group.isOwner || (userId && group.createdByUserId === userId)));
  const isListedInMyGroups = Boolean(group && myGroups.some(({ id }) => id === group.id));
  const joinedOpenGroup = Boolean(group?.privacy === 'open' && (isListedInMyGroups || joinResult?.id === group.id));
  const inferredMembership = joinedOpenGroup
    ? {
        status: 'active' as const,
        role: 'member' as const,
        notificationPreference: 'all' as const,
        feedPreference: 'all' as const,
      }
    : null;
  const membership = group
    ? (group.currentMembership ??
      (joinResult?.id === group.id ? joinResult.currentMembership : null) ??
      inferredMembership)
    : null;
  const resolvedGroup = group ? { ...group, currentMembership: membership } : group;
  const isActiveMember = Boolean(membership?.status === 'active' || isOwner);
  return {
    copy,
    error,
    group: resolvedGroup,
    isFetching,
    isActiveMember,
    isError,
    isLoading: isLoading || (hasUnknownOpenMembership && !isListedInMyGroups && !joinResult && isLoadingMyGroups),
    refetch,
  };
}
