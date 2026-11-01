import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { LANGUAGES } from '@const/enums';
import {
  useGetActivitiesWithRoutesInfiniteQuery,
  useLazyGetLocationsByActivityIdQuery,
} from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { saveActivityTrack } from '@U/activity-track/track-library';
import { MAP_SPORT_TO_TITLE } from '@U/icon-utils';
import { MAPS_PAGE_COPY } from '../const';
import type { ActivityDateFilters } from './utils';

export default function useAddTrackPage() {
  const router = useRouter();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = MAPS_PAGE_COPY[language === LANGUAGES.english ? LANGUAGES.english : LANGUAGES.russian];
  const locale = language === LANGUAGES.english ? 'en-US' : 'ru-RU';
  const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', []);
  const [filters, setFilters] = useState<ActivityDateFilters>({ month: null, day: null, year: null });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [workingActivityId, setWorkingActivityId] = useState<string | null>(null);
  const [getLocations] = useLazyGetLocationsByActivityIdQuery();
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearchQuery(searchQuery.trim()), 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const queryArgs = useMemo(
    () => ({
      search: debouncedSearchQuery || undefined,
      month: filters.month ?? undefined,
      day: filters.day ?? undefined,
      year: filters.year ?? undefined,
      timeZone,
    }),
    [debouncedSearchQuery, filters, timeZone],
  );
  const {
    currentData: data,
    isError,
    isLoading,
    refetch,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetActivitiesWithRoutesInfiniteQuery(queryArgs, { skip: !userId });
  const activities = useMemo(
    () => data?.pages.flatMap(({ activities: pageActivities }) => pageActivities) ?? [],
    [data],
  );
  const availableFilters = data?.pages[0]?.availableFilters ?? { years: [], months: [], days: [] };
  const hasMore = Boolean(data?.pages[data.pages.length - 1]?.hasMore);

  useEffect(() => {
    if (!activities.length && hasMore && !isError && !isLoading && !isFetchingNextPage) void fetchNextPage();
  }, [activities.length, fetchNextPage, hasMore, isError, isFetchingNextPage, isLoading]);

  async function addActivityTrack(activity: (typeof activities)[number]) {
    if (workingActivityId) return;
    setWorkingActivityId(activity.id);
    try {
      const response = await getLocations({ activityId: activity.id, raw: true }).unwrap();
      const locations = response?.locations ?? [];
      if (locations.length < 2) {
        return errorToast(copy.routeUnavailable);
      }
      const sportTitle =
        activity.sport in MAP_SPORT_TO_TITLE
          ? MAP_SPORT_TO_TITLE[activity.sport as keyof typeof MAP_SPORT_TO_TITLE][language]
          : activity.sport;
      await saveActivityTrack({
        activityId: activity.id,
        title: activity.title?.trim() || sportTitle || copy.addTrack,
        date: activity.date,
        sport: activity.sport,
        distanceMeters: activity.distance,
        locations,
      });
      successToast(copy.activityAdded);
      router.back();
    } catch (requestError) {
      errorToast(copy.routeLoadFailed, requestError);
    } finally {
      setWorkingActivityId(null);
    }
  }

  function updateDateFilter(key: keyof ActivityDateFilters, value: number | null) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return {
    activities,
    addActivityTrack,
    availableFilters,
    copy,
    fetchNextPage,
    filters,
    isError,
    isFetchingNextPage,
    isLoading,
    isSearchOpen,
    locale,
    refetch,
    searchQuery,
    setIsSearchOpen,
    setSearchQuery,
    updateDateFilter,
    workingActivityId,
    hasMore,
    language,
  };
}
