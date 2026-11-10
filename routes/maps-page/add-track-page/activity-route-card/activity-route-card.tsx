import { StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { SPORTS_BTNS_VALUES } from '@const/sports';
import { getIconByTypeOfSport } from '@U/icon-utils';
import { formatRouteActivityDate } from '../utils';
import type { ActivityRouteCardProps } from './types';

export default function ActivityRouteCard({
  activity,
  copy,
  language,
  isWorking,
  isDisabled,
  onAdd,
}: ActivityRouteCardProps) {
  const { colors } = useTheme();
  const { id, sport, date, distance, routePointCount, title } = activity;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
      <View style={[styles.icon, { backgroundColor: colors.secondaryContainer }]}>
        {getIconByTypeOfSport(
          (sport in SPORTS_BTNS_VALUES ? sport : SPORTS_BTNS_VALUES.checkAll) as SPORTS_BTNS_VALUES,
          23,
          colors.onSecondaryContainer,
        )}
      </View>
      <View style={styles.info}>
        {title?.trim() ? (
          <Text variant="titleSmall" numberOfLines={1} style={{ color: colors.onSurface }}>
            {title.trim()}
          </Text>
        ) : null}
        <Text variant="titleSmall" numberOfLines={1} style={{ color: colors.onSurface }}>
          {formatRouteActivityDate(date, language)} · {(distance / 1000).toFixed(1)} {copy.km}
        </Text>
        <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>
          {routePointCount} {copy.pointCount}
        </Text>
      </View>
      <IconButton
        mode="contained-tonal"
        icon="plus"
        iconColor={colors.primary}
        containerColor={colors.primaryContainer}
        loading={isWorking}
        disabled={isDisabled}
        accessibilityLabel={copy.addTrack}
        onPress={() => onAdd(activity)}
        style={styles.addButton}
        testID={`add-activity-track-${id}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  icon: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  info: { flex: 1, gap: 3 },
  addButton: { height: 42, margin: 0, width: 42 },
});
