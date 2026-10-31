import { useEffect, useMemo, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useRouter } from 'expo-router';
import { LANGUAGES } from '@const/enums';
import { SPORTS_BTNS_VALUES } from '@const/sports';
import {
  useGetActivitiesWithRoutesInfiniteQuery,
  useLazyGetLocationsByActivityIdQuery,
} from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { parseImportedRoute } from '@U/activity-track/route-import';
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
        errorToast(copy.routeUnavailable);
        return;
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

  async function importRoute() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: ['application/gpx+xml', 'application/vnd.google-earth.kml+xml', 'application/xml', 'text/xml'],
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      if (!/\.(gpx|kml)$/i.test(asset.name)) {
        errorToast(copy.unsupportedRoute);
        return;
      }
      const imported = parseImportedRoute(asset.name, await new File(asset.uri).text());
      await saveActivityTrack({
        activityId: `import-${Date.now()}`,
        title: imported.title,
        date: new Date().toISOString(),
        sport: SPORTS_BTNS_VALUES.run,
        locations: imported.locations,
      });
      successToast(copy.activityAdded);
      router.back();
    } catch (importError) {
      errorToast(copy.importFailed, importError);
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
    importRoute,
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
