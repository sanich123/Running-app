import { useState } from 'react';
import { useRouter } from 'expo-router';
import { LANGUAGES } from '@const/enums';
import { useGetGroupMonthlyStatisticsInfiniteQuery } from '@R/services/groups/groups';
import { useAppSelector } from '@R/typed-hooks';
import { GROUPS_COPY } from '../../../const';
import { createGroupListScrollHandler } from '../utils';
import type { GroupDetails } from '@R/services/groups/types';

export default function useGroupDistanceList(group: GroupDetails) {
  const { id, privacy, currentMembership, isOwner: groupIsOwner, createdByUserId } = group;
  const router = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const copy = GROUPS_COPY[language];
  const isOwner = groupIsOwner || createdByUserId === userId;
  const canSeeStatistics = privacy === 'open' || currentMembership?.status === 'active' || isOwner;
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const { data, isLoading, isError, error, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useGetGroupMonthlyStatisticsInfiniteQuery(
      {
        groupId: id,
        year: selectedMonth.getFullYear(),
        month: selectedMonth.getMonth(),
        timeZone,
      },
      { skip: !canSeeStatistics },
    );
  const statistics = data?.pages.flatMap(({ items }) => items) ?? [];
  const monthLabel = new Intl.DateTimeFormat(language === LANGUAGES.russian ? 'ru-RU' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(selectedMonth);
  const now = new Date();
  const canGoToNextMonth =
    selectedMonth.getFullYear() < now.getFullYear() ||
    (selectedMonth.getFullYear() === now.getFullYear() && selectedMonth.getMonth() < now.getMonth());
  const onScroll = createGroupListScrollHandler({ hasNextPage, isFetchingNextPage, fetchNextPage });
  const previousMonth = () => setSelectedMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1));
  const nextMonth = () => setSelectedMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1));
  const openProfile = (profileId: string) => router.push(`/profile/${profileId}` as never);
  return {
    canGoToNextMonth,
    canSeeStatistics,
    copy,
    error,
    isError,
    isFetchingNextPage,
    isLoading,
    language,
    monthLabel,
    onScroll,
    openProfile,
    previousMonth,
    nextMonth,
    refetch,
    statistics,
  };
}
