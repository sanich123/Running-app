import { useMemo, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, Button, Menu, Text, TextInput, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { SPORTS_BTNS_VALUES } from '@const/sports';
import {
  useGetActivitiesByUserIdInfiniteQuery,
  useLazyGetLocationsByActivityIdQuery,
} from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import EmptyState from '@S/empty-state/empty-state';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { parseImportedRoute } from '@U/activity-track/route-import';
import { saveActivityTrack } from '@U/activity-track/track-library';
import { getIconByTypeOfSport, MAP_SPORT_TO_TITLE } from '@U/icon-utils';
import { formatDate } from '@U/time-formatter';
import { MAPS_PAGE_COPY } from '../const';
import { filterActivitiesByDate, getActivityYears, type ActivityDateFilters } from './utils';

export default function AddTrackPage() {
  const { colors } = useTheme();
  const router = useRouter();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = MAPS_PAGE_COPY[language === LANGUAGES.english ? LANGUAGES.english : LANGUAGES.russian];
  const locale = language === LANGUAGES.english ? 'en-US' : 'ru-RU';
  const [filters, setFilters] = useState<ActivityDateFilters>({ month: null, day: null, year: null });
  const [openFilter, setOpenFilter] = useState<keyof ActivityDateFilters | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [workingActivityId, setWorkingActivityId] = useState<string | null>(null);
  const [getLocations] = useLazyGetLocationsByActivityIdQuery();
  const { data, isError, isLoading, refetch, fetchNextPage, isFetchingNextPage } =
    useGetActivitiesByUserIdInfiniteQuery({ id: userId ?? '' }, { skip: !userId });
  const activities = useMemo(
    () => data?.pages.flatMap(({ activities: pageActivities }) => pageActivities) ?? [],
    [data],
  );
  const filteredActivities = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase(locale);
    return filterActivitiesByDate(activities, filters).filter(
      ({ title, sport }) =>
        !normalizedQuery || `${title ?? ''} ${sport}`.toLocaleLowerCase(locale).includes(normalizedQuery),
    );
  }, [activities, filters, locale, searchQuery]);
  const years = useMemo(() => getActivityYears(activities), [activities]);
  const hasMore = Boolean(data?.pages[data.pages.length - 1]?.hasMore);
  const monthLabel = `${copy.filterMonth}: ${
    filters.month === null
      ? copy.allMonths
      : new Date(2020, filters.month, 1).toLocaleDateString(locale, { month: 'short' })
  }`;
  const dayLabel = `${copy.filterDay}: ${filters.day === null ? copy.allDays : filters.day}`;
  const yearLabel = `${copy.filterYear}: ${filters.year === null ? copy.allYears : filters.year}`;

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

  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: true, title: copy.selectActivity }} />
      <TextInput
        accessibilityLabel={copy.searchActivities}
        dense
        left={<TextInput.Icon icon="magnify" />}
        mode="outlined"
        placeholder={copy.searchActivities}
        value={searchQuery}
        onChangeText={setSearchQuery}
        testID="search-activities"
      />
      <View style={styles.filterRow}>
        <Menu
          visible={openFilter === 'month'}
          onDismiss={() => setOpenFilter(null)}
          anchor={
            <Button compact mode="outlined" onPress={() => setOpenFilter('month')}>
              {monthLabel}
            </Button>
          }>
          <Menu.Item
            title={copy.allMonths}
            onPress={() => {
              setFilters((current) => ({ ...current, month: null }));
              setOpenFilter(null);
            }}
          />
          {Array.from({ length: 12 }, (_, month) => (
            <Menu.Item
              key={month}
              title={new Date(2020, month, 1).toLocaleDateString(locale, { month: 'long' })}
              onPress={() => {
                setFilters((current) => ({ ...current, month }));
                setOpenFilter(null);
              }}
            />
          ))}
        </Menu>
        <Menu
          visible={openFilter === 'day'}
          onDismiss={() => setOpenFilter(null)}
          anchor={
            <Button compact mode="outlined" onPress={() => setOpenFilter('day')}>
              {dayLabel}
            </Button>
          }>
          <Menu.Item
            title={copy.allDays}
            onPress={() => {
              setFilters((current) => ({ ...current, day: null }));
              setOpenFilter(null);
            }}
          />
          {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
            <Menu.Item
              key={day}
              title={String(day)}
              onPress={() => {
                setFilters((current) => ({ ...current, day }));
                setOpenFilter(null);
              }}
            />
          ))}
        </Menu>
        <Menu
          visible={openFilter === 'year'}
          onDismiss={() => setOpenFilter(null)}
          anchor={
            <Button compact mode="outlined" onPress={() => setOpenFilter('year')}>
              {yearLabel}
            </Button>
          }>
          <Menu.Item
            title={copy.allYears}
            onPress={() => {
              setFilters((current) => ({ ...current, year: null }));
              setOpenFilter(null);
            }}
          />
          {years.map((year) => (
            <Menu.Item
              key={year}
              title={String(year)}
              onPress={() => {
                setFilters((current) => ({ ...current, year }));
                setOpenFilter(null);
              }}
            />
          ))}
        </Menu>
        <Button compact icon="file-import-outline" onPress={() => void importRoute()} testID="import-track-file">
          GPX/KML
        </Button>
      </View>
      {isLoading ? (
        <ActivityIndicator style={styles.loading} />
      ) : isError ? (
        <View style={styles.emptyState}>
          <Text style={{ color: colors.onSurfaceVariant }}>{copy.routeLoadFailed}</Text>
          <Button mode="outlined" onPress={() => void refetch()}>
            {copy.retry}
          </Button>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {filteredActivities.length ? (
            filteredActivities.map((activity) => {
              const sportKey =
                activity.sport in MAP_SPORT_TO_TITLE ? (activity.sport as keyof typeof MAP_SPORT_TO_TITLE) : null;
              const sportTitle = sportKey ? MAP_SPORT_TO_TITLE[sportKey][language] : activity.sport;
              return (
                <View
                  key={activity.id}
                  style={[
                    styles.activityCard,
                    { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
                  ]}>
                  <View style={[styles.activityIcon, { backgroundColor: colors.secondaryContainer }]}>
                    {getIconByTypeOfSport(
                      (activity.sport in SPORTS_BTNS_VALUES
                        ? activity.sport
                        : SPORTS_BTNS_VALUES.checkAll) as SPORTS_BTNS_VALUES,
                      23,
                      colors.onSecondaryContainer,
                    )}
                  </View>
                  <View style={styles.activityInfo}>
                    <Text variant="titleSmall" numberOfLines={1} style={{ color: colors.onSurface }}>
                      {activity.title?.trim() || sportTitle || copy.addTrack}
                    </Text>
                    <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>
                      {formatDate(activity.date, language)} · {(activity.distance / 1000).toFixed(1)} {copy.km} ·{' '}
                      {sportTitle}
                    </Text>
                  </View>
                  <Button
                    compact
                    mode="contained-tonal"
                    loading={workingActivityId === activity.id}
                    disabled={Boolean(workingActivityId)}
                    accessibilityLabel={copy.addTrack}
                    onPress={() => void addActivityTrack(activity)}
                    testID={`add-activity-track-${activity.id}`}>
                    {copy.add}
                  </Button>
                </View>
              );
            })
          ) : (
            <EmptyState
              icon="calendar-search"
              title={copy.noActivities}
              message={copy.noActivitiesMessage}
              style={styles.activityEmptyState}
            />
          )}
          {hasMore ? (
            <Button
              mode="outlined"
              loading={isFetchingNextPage}
              disabled={isFetchingNextPage}
              onPress={() => void fetchNextPage()}>
              {copy.loadMore}
            </Button>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  filterRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  loading: { marginTop: 40 },
  emptyState: { alignItems: 'center', gap: 12, marginTop: 48 },
  activityEmptyState: { margin: 0 },
  list: { gap: 10, paddingBottom: 24 },
  activityCard: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  activityIcon: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  activityInfo: { flex: 1, gap: 3 },
});
