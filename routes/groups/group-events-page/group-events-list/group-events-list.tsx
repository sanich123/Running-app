import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Surface, Text, useTheme } from 'react-native-paper';
import { useGetGroupEventsQuery } from '@R/services/groups/groups';
import EmptyState from '@S/empty-state/empty-state';
import type { GroupEventPeriod, GroupEventsCopy } from '../types';

export default function GroupEventsList({
  groupId,
  period,
  canSeeEvents,
  copy,
  locale,
}: {
  groupId: string;
  period: GroupEventPeriod;
  canSeeEvents: boolean;
  copy: GroupEventsCopy;
  locale: string;
}) {
  const { colors } = useTheme();
  const { data: events = [], isLoading } = useGetGroupEventsQuery({ groupId, period }, { skip: !canSeeEvents });

  return isLoading ? (
    <ActivityIndicator />
  ) : !canSeeEvents ? (
    <View style={styles.empty}>
      <EmptyState icon="lock-outline" title={copy.eventsPrivate} />
    </View>
  ) : events.length ? (
    events.map((event) => (
      <Surface key={event.id} style={[styles.event, { backgroundColor: colors.surface }]} elevation={1}>
        <Text variant="titleMedium" style={styles.eventTitle}>
          {event.title}
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.primary }}>
          {new Date(event.startsAt).toLocaleString(locale)}
        </Text>
        {!!event.locationName && <Text variant="bodyMedium">{event.locationName}</Text>}
        {!!event.description && <Text variant="bodyMedium">{event.description}</Text>}
      </Surface>
    ))
  ) : (
    <View style={styles.empty}>
      <EmptyState icon="calendar-star" title={period === 'upcoming' ? copy.noUpcomingEvents : copy.noPastEvents} />
    </View>
  );
}

const styles = StyleSheet.create({
  event: { borderRadius: 18, gap: 8, padding: 16 },
  eventTitle: { fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', minHeight: 240 },
});
