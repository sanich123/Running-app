import { useGetGroupPostsInfiniteQuery } from '@R/services/groups/groups';
import { useAppSelector } from '@R/typed-hooks';
import useAutoModerationRefresh from '@S/moderation/use-auto-moderation-refresh';
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
  const { data, isLoading, isError, error, refetch, hasNextPage, isFetching, isFetchingNextPage, fetchNextPage } =
    useGetGroupPostsInfiniteQuery(id, { skip: !canSeePosts });
  const posts = data?.pages.flatMap(({ items }) => items) ?? [];
  const hasPendingModeration = posts.some(
    ({ photoPending, moderationStatus }) =>
      photoPending || moderationStatus === 'pending' || moderationStatus === 'processing',
  );
  const onScroll = createGroupListScrollHandler({ hasNextPage, isFetchingNextPage, fetchNextPage });
  useAutoModerationRefresh(hasPendingModeration, () => void refetch());

  return { canSeePosts, copy, error, isError, isFetching, isFetchingNextPage, isLoading, onScroll, posts, refetch };
}
