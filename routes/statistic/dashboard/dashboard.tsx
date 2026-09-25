import { useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { LANGUAGES, ROUTES } from '@const/enums';
import { useGetAnnualStatisticsByUserIdQuery } from '@R/services/statistics/statistics';
import { useAppSelector } from '@R/typed-hooks';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import { EMPTY_STATE_COPY } from '@S/empty-state/const';
import EmptyState from '@S/empty-state/empty-state';
import ErrorComponent from '@S/error-component/error-component';
import { getIconNameByTypeOfSport } from '@U/icon-utils';
import ActivityHeatmap from './activity-heatmap';
import AnnualActivityChart from './annual-activity-chart';
import {
  DASHBOARD_HEATMAP,
  DASHBOARD_LABELS,
  DASHBOARD_MONTHS,
  DASHBOARD_SPORTS,
  EMPTY_DASHBOARD_YEAR_DATA,
} from './const';
import DashboardHero from './dashboard-hero';
import DashboardSkeleton from './dashboard-skeleton';
import { buildDashboardYears } from './data';
import SportDistribution from './sport-distribution';
import { getDateKey, getDayIntensity, groupActivitiesBySport, parseDateKey } from './utils';
import type { DashboardDailyActivities, DashboardHeatmapCell, DashboardMetric, DashboardSport } from './types';

export default function Dashboard() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { push } = useRouter();
  const labels = DASHBOARD_LABELS[language];
  const months = DASHBOARD_MONTHS[language];
  const [year, setYear] = useState(new Date().getFullYear());
  const [metric, setMetric] = useState<DashboardMetric>('distance');
  const [sport, setSport] = useState<DashboardSport>('all');
  const [selectedDay, setSelectedDay] = useState<Date>();
  const [selectedMonth, setSelectedMonth] = useState(0);
  const {
    data: annualStatistics,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAnnualStatisticsByUserIdQuery({ userId: userId ?? '' }, { skip: !userId });
  const liveYearData = useMemo(() => buildDashboardYears(annualStatistics), [annualStatistics]);
  const availableYears = useMemo(
    () =>
      Object.keys(liveYearData)
        .map(Number)
        .sort((a, b) => a - b),
    [liveYearData],
  );
  const displayedYear = liveYearData[year] ? year : availableYears.at(-1);
  const yearData = (displayedYear ? liveYearData[displayedYear] : undefined) ?? EMPTY_DASHBOARD_YEAR_DATA;
  const hasYearData = Boolean(displayedYear && liveYearData[displayedYear]);
  const dailyActivities: DashboardDailyActivities = yearData.dailyActivities;
  const activeDays = Object.keys(dailyActivities).length;
  const displayedSport = sport === 'all' || yearData.sports[sport] ? sport : 'all';
  const selectedSportMetrics =
    displayedSport === 'all' ? yearData.totals : (yearData.sports[displayedSport] ?? yearData.totals);
  const sportOptions = useMemo(
    () => [
      ...DASHBOARD_SPORTS,
      ...Object.keys(yearData.sports)
        .sort((a, b) => yearData.sports[b].activities - yearData.sports[a].activities)
        .map((key) => ({ key, icon: getIconNameByTypeOfSport(key) })),
    ],
    [yearData.sports],
  );
  const latestActivityDate = Object.keys(dailyActivities).sort().at(-1);
  const latestActivityDay = latestActivityDate ? parseDateKey(latestActivityDate) : undefined;
  const displayedSelectedDay = selectedDay ?? latestActivityDay ?? new Date(displayedYear ?? year, 0, 1);
  const displayedSelectedMonth = selectedDay ? selectedMonth : (latestActivityDay?.getMonth() ?? selectedMonth);
  const selectedDayActivities = dailyActivities[getDateKey(displayedSelectedDay)] ?? [];
  const selectedDayGroups = groupActivitiesBySport(selectedDayActivities);
  const selectedDayIntensity = getDayIntensity(displayedSelectedDay, displayedSport, metric, dailyActivities);
  const chartWidth = Math.max(260, Math.min(width - 72, 520));

  const heatmapColumns = useMemo<DashboardHeatmapCell[][]>(
    () =>
      Array.from({ length: DASHBOARD_HEATMAP.columns }, (_, column) =>
        Array.from({ length: DASHBOARD_HEATMAP.rows }, (_, row) => {
          const date = new Date(displayedYear ?? year, 0, 1 + column * DASHBOARD_HEATMAP.rows + row);
          return { date, intensity: getDayIntensity(date, displayedSport, metric, dailyActivities) };
        }),
      ),
    [dailyActivities, displayedSport, displayedYear, metric, year],
  );

  const openMonth = (month: number) => {
    if (!displayedYear) return;
    push(`/${ROUTES.monthStatistics}?userId=${userId}&year=${displayedYear}&month=${month}`);
  };

  const chartData = yearData.monthly[metric].map((value, index) => ({
    value,
    label: index % 2 === 0 ? months[index] : '',
    onPress: () => {
      setSelectedMonth(index);
      openMonth(index);
    },
  }));

  const changeYear = (direction: -1 | 1) => {
    const currentYearIndex = displayedYear === undefined ? -1 : availableYears.indexOf(displayedYear);
    const nextYear = availableYears[currentYearIndex + direction];
    if (nextYear === undefined) return;
    const nextYearActivityDate = Object.keys(liveYearData[nextYear].dailyActivities).sort().at(-1);
    const nextYearSelectedDay = nextYearActivityDate ? parseDateKey(nextYearActivityDate) : new Date(nextYear, 0, 1);
    setYear(nextYear);
    setSelectedDay(nextYearSelectedDay);
    setSelectedMonth(nextYearSelectedDay.getMonth());
  };

  const isEmptyResponse = annualStatistics?.isUserHasActivities === false;
  const shouldShowSkeleton = isLoading || (!isError && !annualStatistics) || (!!annualStatistics && !hasYearData);

  if (isError) {
    return (
      <CrossPlatformLayout edges={[]} scrollViewEnabled isError refetch={refetch} outerStyles={styles.outer}>
        <ErrorComponent error={error} refetch={refetch} />
      </CrossPlatformLayout>
    );
  }

  if (shouldShowSkeleton) {
    return (
      <CrossPlatformLayout
        edges={[]}
        scrollViewEnabled
        isLoading={isLoading}
        refetch={refetch}
        outerStyles={styles.outer}>
        <DashboardSkeleton />
      </CrossPlatformLayout>
    );
  }

  if (isEmptyResponse || !displayedYear) {
    return (
      <CrossPlatformLayout edges={[]} scrollViewEnabled refetch={refetch} outerStyles={styles.outer}>
        <EmptyState
          icon="chart-line-variant"
          title={EMPTY_STATE_COPY[language].activities.title}
          message={EMPTY_STATE_COPY[language].activities.message}
        />
      </CrossPlatformLayout>
    );
  }

  return (
    <CrossPlatformLayout edges={[]} scrollViewEnabled refetch={refetch} outerStyles={styles.outer}>
      <View style={styles.headerRow}>
        <View style={styles.yearPicker}>
          <IconButton
            icon="chevron-left"
            size={20}
            iconColor={colors.onSurfaceVariant}
            onPress={() => changeYear(-1)}
            disabled={availableYears.indexOf(displayedYear) <= 0}
            accessibilityLabel={language === LANGUAGES.russian ? 'Предыдущий год' : 'Previous year'}
          />
          <Text variant="titleMedium" style={styles.yearValue}>
            {displayedYear}
          </Text>
          <IconButton
            icon="chevron-right"
            size={20}
            iconColor={colors.onSurfaceVariant}
            onPress={() => changeYear(1)}
            disabled={availableYears.indexOf(displayedYear) === availableYears.length - 1}
            accessibilityLabel={language === LANGUAGES.russian ? 'Следующий год' : 'Next year'}
          />
        </View>
      </View>

      <DashboardHero
        metric={metric}
        metricTotals={selectedSportMetrics}
        activeDays={activeDays}
        peakMonth={months[yearData.bestMonth]}
        labels={labels}
        onMetricChange={setMetric}
        isRefreshing={isFetching}
      />
      <AnnualActivityChart
        data={chartData}
        width={chartWidth}
        months={months}
        selectedMonth={displayedSelectedMonth}
        metric={metric}
        selectedValue={yearData.monthly[metric][displayedSelectedMonth]}
        workoutCount={yearData.monthly.activities[displayedSelectedMonth]}
        labels={labels}
        onFocusMonth={setSelectedMonth}
      />
      <SportDistribution
        sports={yearData.sports}
        totals={yearData.totals}
        sportOptions={sportOptions}
        selectedSport={displayedSport}
        metric={metric}
        labels={labels}
        language={language}
        onSportChange={setSport}
      />
      <ActivityHeatmap
        heatmapColumns={heatmapColumns}
        months={months}
        selectedDay={displayedSelectedDay}
        selectedDayGroups={selectedDayGroups}
        selectedDayIntensity={selectedDayIntensity}
        metric={metric}
        labels={labels}
        language={language}
        onDayPress={(date) => {
          setSelectedDay(date);
          setSelectedMonth(date.getMonth());
        }}
        onOpenMonth={() => openMonth(displayedSelectedDay.getMonth())}
      />
    </CrossPlatformLayout>
  );
}

const styles = StyleSheet.create({
  outer: { padding: 12 },
  headerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 },
  yearPicker: { alignItems: 'center', flexDirection: 'row' },
  yearValue: { fontWeight: '800' },
});
