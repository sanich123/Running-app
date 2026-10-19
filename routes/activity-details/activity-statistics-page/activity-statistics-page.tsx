import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useGetActivityByActivityIdQuery } from '@R/services/activity/activity';
import { useAppSelector } from '@R/typed-hooks';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import ErrorComponent from '@S/error-component/error-component';
import { ACTIVITY_STATISTICS_PAGE_COPY } from './const';
import { buildActivityStatisticSections } from './utils';
import KilometreSplitTable from '../kilometre-split-table/kilometre-split-table';

export default function ActivityStatisticsPage() {
  const { width } = useWindowDimensions();
  const { id: routeActivityId } = useLocalSearchParams();
  const activityId = Array.isArray(routeActivityId) ? routeActivityId[0] : routeActivityId;
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const copy = ACTIVITY_STATISTICS_PAGE_COPY[language];
  const {
    data: activity,
    error,
    isError,
    isLoading,
    refetch,
  } = useGetActivityByActivityIdQuery(
    { activityId: activityId ?? '', viewerId: userId ?? '' },
    { skip: !activityId || !userId },
  );
  const isOwner = Boolean(activity && activity.userId === userId);
  const sections = activity
    ? buildActivityStatisticSections(activity, language, {
        heartRate: isOwner || activity.profile.allowActivityHeartRateViewing !== false,
        elevation: isOwner || activity.profile.allowActivityElevationViewing !== false,
        pace: isOwner || activity.profile.allowActivityPaceViewing !== false,
      })
    : [];
  const pageWidth = width < MAX_MOBILE_WIDTH ? '100%' : MAX_MOBILE_WIDTH;

  return (
    <>
      <Stack.Screen options={{ title: copy.title }} />
      <CrossPlatformLayout
        edges={[]}
        isError={isError}
        isLoading={isLoading}
        scrollViewEnabled={!isLoading && !isError}
        outerStyles={styles.page}>
        <View style={[styles.content, { width: pageWidth, marginHorizontal: Platform.OS === 'web' ? 'auto' : 0 }]}>
          {isLoading ? (
            <ActivityIndicator size="large" testID="activity-statistics-loader" />
          ) : error ? (
            <ErrorComponent error={error} refetch={refetch} />
          ) : activity ? (
            <>
              {sections.map((section) => (
                <View key={section.title} style={styles.section}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    {section.title}
                  </Text>
                  <View
                    style={[
                      styles.sectionCard,
                      { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
                    ]}>
                    <View style={styles.metricsGrid}>
                      {section.metrics.map(({ label, value }, index) => {
                        const isLastRow = index >= section.metrics.length - (section.metrics.length % 2 || 2);
                        const isLastSingleCell =
                          index === section.metrics.length - 1 && section.metrics.length % 2 === 1;
                        return (
                          <View
                            key={label}
                            style={[
                              styles.metricCell,
                              index % 2 === 0 && styles.metricCellLeft,
                              isLastSingleCell && styles.metricCellSingle,
                              !isLastRow && styles.metricCellBottom,
                              { borderColor: colors.outlineVariant },
                            ]}>
                            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                              {label}
                            </Text>
                            <Text variant="titleMedium">{value}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>
              ))}
              {activity.kilometresSplit?.length ? (
                <View
                  style={[
                    styles.splitsCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.outlineVariant,
                      width: '100%',
                      maxWidth: MAX_MOBILE_WIDTH,
                    },
                  ]}>
                  <KilometreSplitTable kilometresSplit={activity.kilometresSplit ?? []} />
                </View>
              ) : null}
            </>
          ) : null}
        </View>
      </CrossPlatformLayout>
    </>
  );
}

const styles = StyleSheet.create({
  page: { paddingVertical: 12 },
  content: { alignSelf: 'center', gap: 16, paddingHorizontal: 4 },
  section: { gap: 8 },
  sectionTitle: { marginLeft: 4 },
  sectionCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  metricCell: { justifyContent: 'center', minHeight: 64, paddingHorizontal: 14, paddingVertical: 8, width: '50%' },
  metricCellLeft: { borderRightWidth: StyleSheet.hairlineWidth },
  metricCellSingle: { borderRightWidth: 0, width: '100%' },
  metricCellBottom: { borderBottomWidth: StyleSheet.hairlineWidth },
  splitsCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', paddingHorizontal: 16, paddingVertical: 8 },
});
