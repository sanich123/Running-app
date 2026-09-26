import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Icon, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { getIconNameByTypeOfSport } from '@U/icon-utils';
import { DASHBOARD_HEATMAP } from './const';
import DashboardSectionHeader from './section-header';
import { formatDayActivityValue, formatLongDate, getDateKey, getHeatmapColor, getSportLabel, withAlpha } from './utils';
import type {
  DashboardActivityGroup,
  DashboardHeatmapCell,
  DashboardHeatmapMonth,
  DashboardLabels,
  DashboardMetric,
} from './types';

interface ActivityHeatmapProps {
  heatmapColumns: DashboardHeatmapCell[][];
  monthSpans: DashboardHeatmapMonth[];
  selectedDay: Date;
  selectedDayGroups: DashboardActivityGroup[];
  selectedDayIntensity: number;
  metric: DashboardMetric;
  labels: DashboardLabels;
  language: LANGUAGES;
  onDayPress: (date: Date) => void;
  onOpenMonth: () => void;
}

export default function ActivityHeatmap({
  heatmapColumns,
  monthSpans,
  selectedDay,
  selectedDayGroups,
  selectedDayIntensity,
  metric,
  labels,
  language,
  onDayPress,
  onOpenMonth,
}: ActivityHeatmapProps) {
  const { colors } = useTheme();
  return (
    <>
      <Card
        mode="contained"
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <Card.Content>
          <DashboardSectionHeader title="Heatmap" subtitle={labels.heatmapHint} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View>
              <View style={styles.monthLabelsRow}>
                <View style={styles.labelSpacer} />
                <View style={styles.monthLabelsTrack}>
                  {monthSpans.map(({ label, columnSpan }) => (
                    <View
                      key={label}
                      style={{ width: columnSpan * (DASHBOARD_HEATMAP.cellSize + DASHBOARD_HEATMAP.gap) }}>
                      <Text variant="labelSmall" style={[styles.monthLabel, { color: colors.onSurfaceVariant }]}>
                        {label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.heatmapBody}>
                <View style={styles.weekdayLabels}>
                  {(['Пн', '', 'Ср', '', 'Пт', '', 'Вс'] as const).map((label, index) => (
                    <Text
                      key={index}
                      variant="labelSmall"
                      style={[styles.weekdayLabel, { color: colors.onSurfaceVariant }]}>
                      {language === LANGUAGES.russian ? label : ['Mo', '', 'We', '', 'Fr', '', 'Su'][index]}
                    </Text>
                  ))}
                </View>
                <View style={styles.heatmapGrid}>
                  {heatmapColumns.map((column, columnIndex) => (
                    <View key={columnIndex} style={styles.heatmapColumn}>
                      {column.map(({ date, intensity, isOutsideYear }) => {
                        const isSelected = getDateKey(date) === getDateKey(selectedDay);
                        return isOutsideYear ? (
                          <View key={date.toISOString()} style={styles.emptyHeatmapCell} />
                        ) : (
                          <Pressable
                            key={date.toISOString()}
                            testID={`dashboard-day-${getDateKey(date)}`}
                            accessibilityRole="button"
                            accessibilityLabel={formatLongDate(date, language)}
                            onPress={() => onDayPress(date)}
                            style={[
                              styles.heatmapCell,
                              { backgroundColor: getHeatmapColor(intensity, colors) },
                              isSelected && { borderColor: colors.onSurface, borderWidth: 2 },
                            ]}
                          />
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
          <View style={styles.legendRow}>
            <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
              {language === LANGUAGES.russian ? 'меньше' : 'less'}
            </Text>
            {[0, 1, 2, 3, 4].map((level) => (
              <View key={level} style={[styles.legendCell, { backgroundColor: getHeatmapColor(level, colors) }]} />
            ))}
            <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
              {language === LANGUAGES.russian ? 'больше' : 'more'}
            </Text>
          </View>
        </Card.Content>
      </Card>
      <Card
        mode="contained"
        style={[styles.selectedCard, { backgroundColor: colors.elevation.level2, borderColor: colors.outlineVariant }]}>
        <Card.Content>
          <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant }}>
            {labels.selectedDay}
          </Text>
          <Text variant="titleLarge" style={styles.selectedDate}>
            {formatLongDate(selectedDay, language)}
          </Text>
          {selectedDayIntensity > 0 && selectedDayGroups.length > 0 ? (
            <>
              {selectedDayGroups.map((group) => (
                <ActivityRow
                  key={group.sport}
                  icon={getIconNameByTypeOfSport(group.sport)}
                  label={getSportLabel(group.sport, labels, language)}
                  value={formatDayActivityValue(group, metric, labels)}
                />
              ))}
              <Button mode="text" icon="arrow-right" contentStyle={styles.openButtonContent} onPress={onOpenMonth}>
                {labels.openMonth}
              </Button>
            </>
          ) : (
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
              {labels.noActivity}
            </Text>
          )}
        </Card.Content>
      </Card>
    </>
  );
}

function ActivityRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.activityRow}>
      <View style={[styles.activityIcon, { backgroundColor: withAlpha(colors.primary, 0.12) }]}>
        <Icon source={icon} color={colors.primary} size={18} />
      </View>
      <Text variant="bodyMedium" style={styles.activityLabel}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, marginBottom: 12 },
  scrollContent: { paddingBottom: 5 },
  monthLabelsRow: { flexDirection: 'row', marginBottom: 7 },
  labelSpacer: { width: 27 },
  monthLabelsTrack: { flexDirection: 'row' },
  monthLabel: { textAlign: 'left' },
  heatmapBody: { flexDirection: 'row' },
  weekdayLabels: { justifyContent: 'space-between', marginRight: 6, paddingVertical: 1 },
  weekdayLabel: { height: 15, textAlign: 'right', width: 21 },
  heatmapGrid: { flexDirection: 'row', gap: DASHBOARD_HEATMAP.gap },
  heatmapColumn: { gap: DASHBOARD_HEATMAP.gap },
  heatmapCell: {
    borderColor: 'transparent',
    borderRadius: 3,
    height: DASHBOARD_HEATMAP.cellSize,
    width: DASHBOARD_HEATMAP.cellSize,
  },
  emptyHeatmapCell: { height: DASHBOARD_HEATMAP.cellSize, width: DASHBOARD_HEATMAP.cellSize },
  legendRow: { alignItems: 'center', flexDirection: 'row', gap: 5, justifyContent: 'flex-end', marginTop: 13 },
  legendCell: { borderRadius: 3, height: 12, width: 12 },
  selectedCard: { borderRadius: 20, borderWidth: 1, marginBottom: 24 },
  selectedDate: { fontFamily: FONT_FAMILIES.extraBold, marginBottom: 14, marginTop: 4 },
  activityRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 10 },
  activityIcon: {
    alignItems: 'center',
    borderRadius: 10,
    height: 32,
    justifyContent: 'center',
    marginRight: 9,
    width: 32,
  },
  activityLabel: { flex: 1, fontFamily: FONT_FAMILIES.semiBold },
  openButtonContent: { flexDirection: 'row-reverse' },
});
