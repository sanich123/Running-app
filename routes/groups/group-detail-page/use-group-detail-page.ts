import { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useGetGroupByIdQuery, useJoinGroupMutation } from '@R/services/groups/groups';
import { useAppSelector } from '@R/typed-hooks';
import { GROUPS_COPY } from '../const';

export default function useGroupDetailPage() {
  const { groupId: rawGroupId } = useLocalSearchParams<{ groupId: string }>();
  const groupId = Array.isArray(rawGroupId) ? rawGroupId[0] : rawGroupId;
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const copy = GROUPS_COPY[language];
  const { data: group, isLoading, isError, error, refetch } = useGetGroupByIdQuery(groupId ?? '', { skip: !groupId });
  const [, { data: joinResult }] = useJoinGroupMutation({
    fixedCacheKey: `group-join-${groupId ?? 'unresolved'}`,
  });

  useEffect(() => {
    if (!group?.photoPending) return;
    const interval = setInterval(() => void refetch(), 8000);
    return () => clearInterval(interval);
  }, [group?.photoPending, refetch]);

  const isOwner = Boolean(group && (group.isOwner || (userId && group.createdByUserId === userId)));
  const hasRecordedJoin = joinResult?.id === group?.id;
  const isActiveMember = Boolean(
    group?.currentMembership?.status === 'active' ||
    isOwner ||
    (group && group.currentMembership === null && hasRecordedJoin && group.privacy === 'open'),
  );
  return {
    copy,
    error,
    group,
    isActiveMember,
    isError,
    isLoading,
    refetch,
  };
}
