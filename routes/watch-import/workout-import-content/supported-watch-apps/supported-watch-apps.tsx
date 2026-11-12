import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Chip, Icon, Text, useTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { WORKOUT_IMPORT_COPY } from '../../workout-import/const';
import { SUPPORTED_WATCH_APPS, type AppSupport, type DataAvailability } from './const';

type SupportedAppsCopy =
  (typeof WORKOUT_IMPORT_COPY)['ru']['supportedApps'] | (typeof WORKOUT_IMPORT_COPY)['en']['supportedApps'];

export default function SupportedWatchApps({
  isRussian,
  platform,
}: {
  isRussian: boolean;
  platform: 'ios' | 'android';
}) {
  const [expanded, setExpanded] = useState(false);
  const { colors } = useTheme();
  const language = isRussian ? 'ru' : 'en';
  const copy = WORKOUT_IMPORT_COPY[language].supportedApps;
  const apps = SUPPORTED_WATCH_APPS[platform];

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.title}
          accessibilityState={{ expanded }}
          onPress={() => setExpanded((current) => !current)}
          style={styles.heading}
          testID="watch-import-supported-apps">
          <View style={[styles.headingIcon, { backgroundColor: colors.primaryContainer }]}>
            <Icon source="watch-variant" size={21} color={colors.primary} />
          </View>
          <Text variant="titleMedium" style={styles.headingTitle}>
            {copy.title}
          </Text>
          <Icon source={expanded ? 'chevron-up' : 'chevron-down'} size={24} color={colors.onSurfaceVariant} />
        </Pressable>
        {expanded ? (
          <View style={styles.content}>
            <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
              {copy[platform]}
            </Text>

            <View style={styles.section}>
              <Text variant="titleSmall">{copy.directTitle[platform]}</Text>
              <View style={styles.legend}>
                <LegendItem icon="run" label={copy.workout} color={colors.onSurfaceVariant} />
                <LegendItem icon="map-marker-path" label={copy.route} color={colors.onSurfaceVariant} />
                <LegendItem icon="heart-pulse" label={copy.heartRate} color={colors.onSurfaceVariant} />
              </View>
              <View style={styles.statusLegend}>
                <StatusLegend icon="check" label={copy.yes} color={colors.primary} />
                <StatusLegend icon="close" label={copy.no} color={colors.error} />
                <StatusLegend icon="minus" label={copy.partial} color={colors.secondary} />
                <StatusLegend icon="help" label={copy.unknown} color={colors.tertiary} />
              </View>
              <View style={styles.appList}>
                {apps.direct.map((app) => (
                  <AppRow key={app.name} app={app} copy={copy} colors={colors} />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text variant="titleSmall">{copy.healthSyncTitle}</Text>
              <View style={styles.healthSyncApps}>
                {apps.healthSync.map((name) => (
                  <Chip key={name} compact icon="sync" style={styles.chip} textStyle={styles.chipText}>
                    {name}
                  </Chip>
                ))}
              </View>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                {copy.healthSyncNote}
              </Text>
            </View>
          </View>
        ) : null}
      </Card.Content>
    </Card>
  );
}

function AppRow({ app, copy, colors }: { app: AppSupport; copy: SupportedAppsCopy; colors: MD3Theme['colors'] }) {
  return (
    <View style={styles.appRow}>
      <Text variant="bodyMedium" numberOfLines={2} style={styles.appName}>
        {app.name}
      </Text>
      <View style={styles.indicators}>
        <DataIndicator icon="run" label={copy.workout} state={app.workout} copy={copy} colors={colors} />
        <DataIndicator icon="map-marker-path" label={copy.route} state={app.route} copy={copy} colors={colors} />
        <DataIndicator icon="heart-pulse" label={copy.heartRate} state={app.heartRate} copy={copy} colors={colors} />
      </View>
    </View>
  );
}

function DataIndicator({
  icon,
  label,
  state,
  copy,
  colors,
}: {
  icon: string;
  label: string;
  state: DataAvailability;
  copy: SupportedAppsCopy;
  colors: MD3Theme['colors'];
}) {
  const stateCopy =
    state === 'yes' ? copy.yes : state === 'no' ? copy.no : state === 'partial' ? copy.partial : copy.unknown;
  const iconColor =
    state === 'yes'
      ? colors.primary
      : state === 'no'
        ? colors.error
        : state === 'partial'
          ? colors.secondary
          : colors.tertiary;
  const statusIcon = state === 'no' ? 'close' : state === 'partial' ? 'minus' : 'help';

  return (
    <View accessible accessibilityLabel={`${label}: ${stateCopy}`} style={styles.indicator}>
      <Icon source={icon} size={19} color={iconColor} />
      {state !== 'yes' ? (
        <View style={[styles.statusMark, { backgroundColor: iconColor }]}>
          <Icon source={statusIcon} size={8} color={colors.surface} />
        </View>
      ) : null}
    </View>
  );
}

function LegendItem({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <View style={styles.legendItem}>
      <Icon source={icon} size={16} color={color} />
      <Text variant="labelSmall">{label}</Text>
    </View>
  );
}

function StatusLegend({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <View style={styles.legendItem}>
      <Icon source={icon} size={13} color={color} />
      <Text variant="labelSmall" style={styles.legendStatusText}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 2 },
  heading: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  headingIcon: { alignItems: 'center', borderRadius: 16, height: 32, justifyContent: 'center', width: 32 },
  headingTitle: { flex: 1 },
  content: { gap: 12, marginTop: 8, paddingBottom: 4 },
  section: { gap: 6 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 12, rowGap: 4 },
  statusLegend: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 9, rowGap: 2 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  legendStatusText: { textTransform: 'lowercase' },
  appList: { gap: 2 },
  appRow: { minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  appName: { flex: 1 },
  indicators: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  indicator: { position: 'relative', width: 22, height: 23, alignItems: 'center', justifyContent: 'center' },
  statusMark: {
    position: 'absolute',
    right: -2,
    top: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthSyncApps: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  chip: { margin: 0 },
  chipText: { fontSize: 12 },
});
