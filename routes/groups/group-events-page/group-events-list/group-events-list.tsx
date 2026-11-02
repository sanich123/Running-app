import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Surface, Text, useTheme } from 'react-native-paper';
import { useGetGroupEventsQuery } from '@R/services/groups/groups';
import EmptyState from '@S/empty-state/empty-state';
import { GROUP_SPORT_LABELS } from '../../const';
import type { GroupEventPeriod, GroupEventsCopy } from '../types';
import type { GroupEvent } from '@R/services/groups/types';

export default function GroupEventsList({
  groupId,
  period,
  canSeeEvents,
  copy,
  locale,
  events,
  isLoading: isLoadingProvidedEvents,
}: {
  groupId: string;
  period: GroupEventPeriod;
  canSeeEvents: boolean;
  copy: GroupEventsCopy;
  locale: string;
  events?: GroupEvent[];
  isLoading?: boolean;
}) {
  const { colors } = useTheme();
  const { data: queriedEvents = [], isLoading: isLoadingQuery } = useGetGroupEventsQuery(
    { groupId, period },
    { skip: !canSeeEvents || events !== undefined },
  );
  const visibleEvents = events ?? queriedEvents;
  const isLoading = events === undefined ? isLoadingQuery : Boolean(isLoadingProvidedEvents);

  return isLoading ? (
    <ActivityIndicator />
  ) : !canSeeEvents ? (
    <View style={styles.empty}>
      <EmptyState icon="lock-outline" title={copy.eventsPrivate} />
    </View>
  ) : visibleEvents.length ? (
    visibleEvents.map(({ id, title, startsAt, sport, distanceKm, locationName, description }) => (
      <Surface key={id} style={[styles.event, { backgroundColor: colors.surface }]} elevation={1}>
        <Text variant="titleMedium" style={styles.eventTitle}>
          {title}
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.primary }}>
          {new Date(startsAt).toLocaleString(locale)}
        </Text>
        {(sport || typeof distanceKm === 'number') && (
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
            {sport ? GROUP_SPORT_LABELS[sport][locale === 'ru-RU' ? 'ru' : 'en'] : copy.eventSport}
            {typeof distanceKm === 'number' ? ` · ${distanceKm.toLocaleString(locale)} ${copy.distanceUnit}` : ''}
          </Text>
        )}
        {!!locationName && <Text variant="bodyMedium">{locationName}</Text>}
        {!!description && <Text variant="bodyMedium">{description}</Text>}
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
