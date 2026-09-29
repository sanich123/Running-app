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
  DASHBOARD_LABELS,
  DASHBOARD_LAYOUT,
  DASHBOARD_MONTHS,
  DASHBOARD_SPORTS,
  EMPTY_DASHBOARD_YEAR_DATA,
} from './const';
import DashboardHero from './dashboard-hero';
import DashboardSkeleton from './dashboard-skeleton';
import { buildDashboardYears } from './data';
import SportDistribution from './sport-distribution';
import {
  buildHeatmapColumns,
  getDateKey,
  getAnnualChartScale,
  getHeatmapMonthSpans,
  getDayIntensity,
  groupActivitiesBySport,
  parseDateKey,
} from './utils';
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
  const [selectedMonth, setSelectedMonth] = useState<number>();
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
  const displayedSelectedMonth = selectedMonth ?? latestActivityDay?.getMonth() ?? 0;
  const selectedDayActivities = dailyActivities[getDateKey(displayedSelectedDay)] ?? [];
  const selectedDayGroups = groupActivitiesBySport(selectedDayActivities);
  const selectedDayIntensity = getDayIntensity(displayedSelectedDay, displayedSport, metric, dailyActivities);
  const chartWidth = Math.max(
    0,
    Math.min(
      width -
        DASHBOARD_LAYOUT.outerHorizontalPadding * 2 -
        DASHBOARD_LAYOUT.cardBorderWidth * 2 -
        DASHBOARD_LAYOUT.cardContentHorizontalPadding * 2 -
        DASHBOARD_LAYOUT.chartYAxisLabelWidth -
        DASHBOARD_LAYOUT.chartEndSpacing,
      DASHBOARD_LAYOUT.maxChartWidth - DASHBOARD_LAYOUT.chartYAxisLabelWidth - DASHBOARD_LAYOUT.chartEndSpacing,
    ),
  );

  const heatmapColumns = useMemo<DashboardHeatmapCell[][]>(
    () => buildHeatmapColumns(displayedYear ?? year, displayedSport, metric, dailyActivities),
    [dailyActivities, displayedSport, displayedYear, metric, year],
  );
  const heatmapMonths = useMemo(
    () => getHeatmapMonthSpans(displayedYear ?? year, months, heatmapColumns),
    [displayedYear, heatmapColumns, months, year],
  );

  const openMonth = (month: number) => {
    if (!displayedYear) return;
    push(`/${ROUTES.monthStatistics}?userId=${userId}&year=${displayedYear}&month=${month}`);
  };

  const chartData = yearData.monthly[metric].map((value, index) => ({
    value: Math.max(0, value),
    label: index % 2 === 0 ? months[index] : '',
    onPress: () => setSelectedMonth(index),
  }));
  const chartScale = getAnnualChartScale(
    chartData.map(({ value }) => value),
    metric,
  );

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
  const shouldShowSkeleton =
    !isEmptyResponse && (isLoading || (!isError && !annualStatistics) || (!!annualStatistics && !hasYearData));

  return (
    <CrossPlatformLayout edges={[]} scrollViewEnabled isError={isError} refetch={refetch} outerStyles={styles.outer}>
      {isError ? (
        <ErrorComponent error={error} refetch={refetch} />
      ) : shouldShowSkeleton ? (
        <DashboardSkeleton />
      ) : isEmptyResponse || !displayedYear ? (
        <EmptyState
          icon="chart-line-variant"
          title={EMPTY_STATE_COPY[language].activities.title}
          message={EMPTY_STATE_COPY[language].activities.message}
        />
      ) : (
        <>
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
            averageValue={chartScale.average}
            maxValue={chartScale.maxValue}
            noOfSections={chartScale.noOfSections}
            stepValue={chartScale.stepValue}
            workoutCount={yearData.monthly.activities[displayedSelectedMonth]}
            labels={labels}
            onFocusMonth={setSelectedMonth}
            onOpenMonth={openMonth}
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
            monthSpans={heatmapMonths}
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
        </>
      )}
    </CrossPlatformLayout>
  );
}

const styles = StyleSheet.create({
  outer: { paddingHorizontal: DASHBOARD_LAYOUT.outerHorizontalPadding, paddingVertical: 12 },
  headerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 },
  yearPicker: { alignItems: 'center', flexDirection: 'row' },
  yearValue: { fontWeight: '800' },
});
