import { useEffect } from 'react';
import { useGetGroupPostsInfiniteQuery } from '@R/services/groups/groups';
import { useAppSelector } from '@R/typed-hooks';
import { GROUPS_COPY } from '../../../const';
import { createGroupListScrollHandler } from '../utils';
import type { GroupDetails } from '@R/services/groups/types';

export default function useGroupPostsList(group: GroupDetails) {
  const { id, privacy, currentMembership, isOwner: groupIsOwner, createdByUserId } = group;
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const copy = GROUPS_COPY[language];
  const isOwner = groupIsOwner || createdByUserId === userId;
  const canSeePosts = privacy === 'open' || currentMembership?.status === 'active' || isOwner;
  const { data, isLoading, isError, error, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useGetGroupPostsInfiniteQuery(id, { skip: !canSeePosts });
  const posts = data?.pages.flatMap(({ items }) => items) ?? [];
  const hasPendingPhoto = posts.some(({ photoPending }) => photoPending);
  const onScroll = createGroupListScrollHandler({ hasNextPage, isFetchingNextPage, fetchNextPage });

  useEffect(() => {
    if (!hasPendingPhoto) return;
    const interval = setInterval(() => void refetch(), 8000);
    return () => clearInterval(interval);
  }, [hasPendingPhoto, refetch]);

  return { canSeePosts, copy, error, isError, isFetchingNextPage, isLoading, onScroll, posts, refetch };
}
