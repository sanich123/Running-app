import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Chip, Icon, ProgressBar, Text, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { getIconNameByTypeOfSport } from '@U/icon-utils';
import DashboardSectionHeader from './section-header';
import { formatMetricValue, getSportLabel, withAlpha } from './utils';
import type {
  DashboardLabels,
  DashboardMetric,
  DashboardMetricTotals,
  DashboardSport,
  DashboardSportOption,
} from './types';
import type { LANGUAGES } from '@const/enums';

interface SportDistributionProps {
  sports: Record<string, DashboardMetricTotals>;
  totals: DashboardMetricTotals;
  sportOptions: DashboardSportOption[];
  selectedSport: DashboardSport;
  metric: DashboardMetric;
  labels: DashboardLabels;
  language: LANGUAGES;
  onSportChange: (sport: DashboardSport) => void;
}

export default function SportDistribution({
  sports,
  totals,
  sportOptions,
  selectedSport,
  metric,
  labels,
  language,
  onSportChange,
}: SportDistributionProps) {
  const { colors } = useTheme();
  return (
    <Card
      mode="contained"
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
      <Card.Content>
        <DashboardSectionHeader title={labels.sportDistribution} subtitle={labels.byWorkouts} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {sportOptions.map(({ key, icon }) => (
            <Chip
              key={key}
              compact
              icon={icon}
              mode={selectedSport === key ? 'flat' : 'outlined'}
              selected={selectedSport === key}
              showSelectedOverlay
              selectedColor={colors.onPrimaryContainer}
              style={[styles.chip, { borderColor: colors.outlineVariant }]}
              onPress={() => onSportChange(key)}>
              {key === 'all' ? labels.allSports : getSportLabel(key, labels, language)}
            </Chip>
          ))}
        </ScrollView>
        {Object.keys(sports).map((key) => {
          const sportMetrics = sports[key];
          const value = sportMetrics[metric];
          const color = colors.primary;
          return (
            <Pressable key={key} style={styles.sportRow} onPress={() => onSportChange(key)} accessibilityRole="button">
              <View style={[styles.sportIcon, { backgroundColor: withAlpha(color, 0.12) }]}>
                <Icon source={getIconNameByTypeOfSport(key)} color={color} size={18} />
              </View>
              <View style={styles.sportBody}>
                <View style={styles.sportLabelRow}>
                  <Text variant="bodyMedium" style={styles.sportName}>
                    {getSportLabel(key, labels, language)}
                  </Text>
                  <Text variant="labelLarge" style={{ color }}>
                    {formatMetricValue(value, metric, labels)}
                  </Text>
                </View>
                <ProgressBar
                  progress={totals[metric] > 0 ? value / totals[metric] : 0}
                  color={color}
                  style={styles.progress}
                />
              </View>
            </Pressable>
          );
        })}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, marginBottom: 12 },
  chipRow: { gap: 8, paddingBottom: 12 },
  chip: { borderRadius: 12 },
  sportRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 13 },
  sportIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    marginRight: 10,
    width: 36,
  },
  sportBody: { flex: 1 },
  sportLabelRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  sportName: { fontFamily: FONT_FAMILIES.semiBold },
  progress: { borderRadius: 4, height: 7 },
});
