import { Fragment } from 'react';
import { View, StyleSheet } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { KM_SPLITS } from './const';
import { getFastestSplitDuration, getSplitBarWidth, getSplitMetric, getColumnWidth } from './utils';
import type { ActivityKilometreSplit } from '@S/card/types';

export default function KilometreSplitTable({ kilometresSplit }: { kilometresSplit: ActivityKilometreSplit[] }) {
  const { language } = useAppSelector(({ settings }) => settings);
  const validSplits = (Array.isArray(kilometresSplit) ? kilometresSplit : []).filter(
    (split) => Number.isFinite(split?.lastKilometerDuration) && split.lastKilometerDuration > 0,
  );
  const fastestSplitDuration = getFastestSplitDuration(validSplits);
  const kmLabels = validSplits.map((_, index) => `${index + 1}`);
  const splitMetrics = validSplits.map((split) => getSplitMetric(split));
  const elevationLabels = validSplits.map((split) =>
    Number.isFinite(split.lastKilometerAltitude) ? `${Math.round(split.lastKilometerAltitude)}` : '—',
  );
  const kmColumnWidth = getColumnWidth([KM_SPLITS[language].km, ...kmLabels], 24);
  const durationColumnWidth = getColumnWidth(splitMetrics, 42);
  const elevationColumnWidth = getColumnWidth([KM_SPLITS[language].elev, ...elevationLabels], 32);
  const { colors } = useTheme();

  return (
    <>
      <Text variant="titleLarge" style={[styles.title, { color: colors.onSurface }]}>
        {KM_SPLITS[language].splits}
      </Text>
      <View style={styles.headerRow}>
        <View style={[styles.kmColumn, { width: kmColumnWidth }]}>
          <Text variant="labelMedium" style={[styles.headerText, { color: colors.onSurfaceVariant }]}>
            {KM_SPLITS[language].km}
          </Text>
        </View>
        <View style={styles.paceColumn}>
          <Text variant="labelMedium" style={[styles.headerText, { color: colors.onSurfaceVariant }]}>
            {KM_SPLITS[language].pace}
          </Text>
        </View>
        <View style={[styles.elevationColumn, { width: elevationColumnWidth }]}>
          <Text variant="labelMedium" style={[styles.headerText, { color: colors.onSurfaceVariant }]}>
            {KM_SPLITS[language].elev}
          </Text>
        </View>
      </View>
      {validSplits.map((split, index) => (
        <Fragment key={`${split.lastKilometerAltitude}/${split.lastKilometerDuration}/${index}`}>
          <View style={styles.splitRow} key={`${index}/${split.lastKilometerAltitude * split.lastKilometerDuration}`}>
            <View style={[styles.kmColumn, { width: kmColumnWidth }]}>
              <Text style={{ color: colors.onSurface }} variant="bodyLarge">
                {kmLabels[index]}
              </Text>
            </View>
            <View style={[styles.durationColumn, { width: durationColumnWidth }]}>
              <Text
                style={{ color: colors.onSurface }}
                variant="bodyLarge"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}>
                {splitMetrics[index]}
              </Text>
            </View>

            <View style={styles.barColumn}>
              <View style={[styles.barTrack, { backgroundColor: colors.surfaceVariant }]}>
                <View
                  style={[
                    styles.bar,
                    { backgroundColor: colors.primary, width: `${getSplitBarWidth(split, fastestSplitDuration)}%` },
                  ]}
                />
              </View>
            </View>
            <View style={[styles.elevationColumn, { width: elevationColumnWidth }]}>
              <Text
                style={{ color: colors.onSurface }}
                variant="bodyLarge"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}>
                {elevationLabels[index]}
              </Text>
            </View>
          </View>
          {index < validSplits.length - 1 ? <Divider style={{ backgroundColor: colors.outlineVariant }} /> : null}
        </Fragment>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '800', paddingBottom: 16 },
  headerRow: { flexDirection: 'row', width: '100%', paddingBottom: 4 },
  headerText: { fontWeight: '800' },
  splitRow: { alignItems: 'center', flexDirection: 'row', minHeight: 38, width: '100%' },
  kmColumn: { flexShrink: 0 },
  paceColumn: { flex: 1, minWidth: 0 },
  durationColumn: { flexShrink: 0 },
  barColumn: { flex: 1, justifyContent: 'center', minWidth: 0, paddingHorizontal: 8 },
  // Keep only the space needed for the elevation value so the pace bar does not
  // leave an unnecessarily large gap before the right-aligned column.
  elevationColumn: { alignItems: 'flex-end', flexShrink: 0 },
  barTrack: { borderRadius: 4, height: 8, overflow: 'hidden', width: '100%' },
  bar: { borderRadius: 4, height: '100%' },
});
