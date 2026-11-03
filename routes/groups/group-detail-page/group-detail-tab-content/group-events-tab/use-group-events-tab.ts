import { useState } from 'react';
import { LANGUAGES } from '@const/enums';
import { useGetGroupEventsInfiniteQuery } from '@R/services/groups/groups';
import { useAppSelector } from '@R/typed-hooks';
import { GROUPS_COPY } from '../../../const';
import { createGroupListScrollHandler } from '../utils';
import type { GroupEventPeriod } from '../../../group-events-page/types';
import type { GroupDetails } from '@R/services/groups/types';

export default function useGroupEventsTab(group: GroupDetails) {
  const { id, privacy, currentMembership, isOwner: groupIsOwner, createdByUserId } = group;
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const copy = GROUPS_COPY[language];
  const isOwner = groupIsOwner || createdByUserId === userId;
  const canSeeEvents = privacy === 'open' || currentMembership?.status === 'active' || isOwner;
  const [period, setPeriod] = useState<GroupEventPeriod>('upcoming');
  const { data, isLoading, isError, error, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useGetGroupEventsInfiniteQuery({ groupId: id, period }, { skip: !canSeeEvents });
  const events = data?.pages.flatMap(({ items }) => items) ?? [];
  const onScroll = createGroupListScrollHandler({ hasNextPage, isFetchingNextPage, fetchNextPage });
  const locale = language === LANGUAGES.russian ? 'ru-RU' : 'en-US';

  return {
    canSeeEvents,
    copy,
    error,
    events,
    isError,
    isFetchingNextPage,
    isLoading,
    locale,
    onScroll,
    period,
    refetch,
    setPeriod,
  };
}
