import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, IconButton, Text } from 'react-native-paper';
import ErrorComponent from '@S/error-component/error-component';
import GroupMemberRow from '../../../group-member-row/group-member-row';
import useGroupDistanceList from './use-group-distance-list';
import type { GroupDetails } from '@R/services/groups/types';

export default function GroupDistanceList({ group }: { group: GroupDetails }) {
  const {
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
  } = useGroupDistanceList(group);
  const {
    previousMonth: previousMonthLabel,
    nextMonth: nextMonthLabel,
    statsError,
    distanceUnit,
    noMonthlyStats,
  } = copy;
  const locale = language === 'russian' ? 'ru-RU' : 'en-US';

  return canSeeStatistics ? (
    <ScrollView
      contentContainerStyle={styles.listContent}
      onScroll={onScroll}
      scrollEventThrottle={200}
      testID="group-detail-scroll">
      <View style={styles.section}>
        <View style={styles.monthControls}>
          <IconButton icon="chevron-left" accessibilityLabel={previousMonthLabel} onPress={previousMonth} />
          <Text variant="bodyMedium" style={styles.monthLabel}>
            {monthLabel}
          </Text>
          <IconButton
            icon="chevron-right"
            accessibilityLabel={nextMonthLabel}
            disabled={!canGoToNextMonth}
            onPress={nextMonth}
          />
        </View>
        {isLoading ? (
          <ActivityIndicator />
        ) : isError ? (
          <ErrorComponent error={error ?? new Error(statsError)} refetch={refetch} />
        ) : statistics.length ? (
          statistics.map(({ userId, profile, totalDistance }, index) => (
            <GroupMemberRow
              key={userId}
              member={{ userId, role: 'member', status: 'active', joinedAt: null, profile }}
              canManage={false}
              isUpdating={false}
              copy={copy}
              language={language}
              rank={index + 1}
              distanceLabel={`${(totalDistance / 1000).toLocaleString(locale, { maximumFractionDigits: 1 })} ${distanceUnit}`}
              onPressProfile={() => openProfile(userId)}
            />
          ))
        ) : (
          <Text variant="bodyMedium" style={styles.emptyText}>
            {noMonthlyStats}
          </Text>
        )}
        {isFetchingNextPage ? <ActivityIndicator style={styles.nextPageLoader} /> : null}
      </View>
    </ScrollView>
  ) : (
    <View />
  );
}

const styles = StyleSheet.create({
  listContent: { flexGrow: 1, paddingBottom: 24 },
  section: { flex: 1, gap: 10 },
  monthControls: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  monthLabel: { minWidth: 140, textAlign: 'center', textTransform: 'capitalize' },
  emptyText: { alignSelf: 'center', flex: 1, marginTop: 12, textAlign: 'center', textAlignVertical: 'center' },
  nextPageLoader: { marginVertical: 12 },
});
