import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Chip, Icon, Text, useTheme } from 'react-native-paper';
import { WORKOUT_IMPORT_COPY } from '../../workout-import/const';
import { SUPPORTED_WATCH_APPS, WATCH_APP_STATUS_WARNING_COLORS } from './const';

export default function SupportedWatchApps({
  isRussian,
  platform,
}: {
  isRussian: boolean;
  platform: 'ios' | 'android';
}) {
  const [expanded, setExpanded] = useState(false);
  const { colors, dark } = useTheme();
  const warningColor = dark ? WATCH_APP_STATUS_WARNING_COLORS.dark : WATCH_APP_STATUS_WARNING_COLORS.light;
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
                {[
                  { icon: 'run', label: copy.workout },
                  { icon: 'map-marker-path', label: copy.route },
                  { icon: 'heart-pulse', label: copy.heartRate },
                ].map(({ icon, label }) => (
                  <View key={icon} style={styles.legendItem}>
                    <Icon source={icon} size={16} color={colors.onSurfaceVariant} />
                    <Text variant="labelSmall">{label}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.statusLegend}>
                {[
                  { icon: 'check', label: copy.yes, color: colors.tertiary },
                  { icon: 'close', label: copy.no, color: colors.error },
                  { icon: 'minus', label: copy.partial, color: warningColor },
                  { icon: 'help', label: copy.unknown, color: warningColor },
                ].map(({ icon, label, color }) => (
                  <View key={icon} style={styles.legendItem}>
                    <Icon source={icon} size={13} color={color} />
                    <Text variant="labelSmall" style={styles.legendStatusText}>
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.appList}>
                {apps.direct.map((app) => {
                  const indicators = [
                    { icon: 'run', label: copy.workout, state: app.workout },
                    { icon: 'map-marker-path', label: copy.route, state: app.route },
                    { icon: 'heart-pulse', label: copy.heartRate, state: app.heartRate },
                  ];

                  return (
                    <View key={app.name} style={styles.appRow}>
                      <Text variant="bodyMedium" numberOfLines={2} style={styles.appName}>
                        {app.name}
                      </Text>
                      <View style={styles.indicators}>
                        {indicators.map(({ icon, label, state }) => {
                          const stateCopy =
                            state === 'yes'
                              ? copy.yes
                              : state === 'no'
                                ? copy.no
                                : state === 'partial'
                                  ? copy.partial
                                  : copy.unknown;
                          const iconColor =
                            state === 'yes' ? colors.tertiary : state === 'no' ? colors.error : warningColor;
                          const statusIcon = state === 'no' ? 'close' : state === 'partial' ? 'minus' : 'help';

                          return (
                            <View
                              key={icon}
                              accessible
                              accessibilityLabel={`${label}: ${stateCopy}`}
                              style={styles.indicator}>
                              <Icon source={icon} size={19} color={iconColor} />
                              {state !== 'yes' ? (
                                <View style={[styles.statusMark, { backgroundColor: iconColor }]}>
                                  <Icon source={statusIcon} size={8} color={colors.surface} />
                                </View>
                              ) : null}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
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
