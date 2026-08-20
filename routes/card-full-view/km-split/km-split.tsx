import { Fragment } from 'react';
import { View, StyleSheet } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { formatDurationMinsSecs } from '@U/time-formatter';
import { KM_SPLITS } from './const';
import type { ActivityKilometreSplit } from '@S/card/types';

export default function KmSplit({ kilometresSplit }: { kilometresSplit: ActivityKilometreSplit[] }) {
  const validSplits = (Array.isArray(kilometresSplit) ? kilometresSplit : []).filter(
    (split) => Number.isFinite(split?.lastKilometerDuration) && split.lastKilometerDuration > 0,
  );
  const fastestKm = validSplits.length
    ? Math.min(...validSplits.map(({ lastKilometerDuration }) => lastKilometerDuration))
    : 0;
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();

  return (
    <>
      <Text variant="titleLarge" style={[styles.title, { color: colors.onSurface }]}>
        {KM_SPLITS[language].splits}
      </Text>
      <View style={styles.headerRow}>
        <View style={styles.kmColumn}>
          <Text variant="labelMedium" style={[styles.headerText, { color: colors.onSurfaceVariant }]}>
            {KM_SPLITS[language].km}
          </Text>
        </View>
        <View style={styles.paceColumn}>
          <Text variant="labelMedium" style={[styles.headerText, { color: colors.onSurfaceVariant }]}>
            {KM_SPLITS[language].pace}
          </Text>
        </View>
        <View style={styles.elevationColumn}>
          <Text variant="labelMedium" style={[styles.headerText, { color: colors.onSurfaceVariant }]}>
            {KM_SPLITS[language].elev}
          </Text>
        </View>
      </View>
      {validSplits.map(({ lastKilometerAltitude, lastKilometerDuration }, index) => (
        <Fragment key={`${lastKilometerAltitude}/${lastKilometerDuration}/${index}`}>
          <View style={styles.splitRow} key={`${index}/${lastKilometerAltitude * lastKilometerDuration}`}>
            <View style={styles.kmColumn}>
              <Text style={{ color: colors.onSurface }} variant="bodyLarge">
                {index + 1}
              </Text>
            </View>
            <View style={styles.durationColumn}>
              <Text
                style={{ color: colors.onSurface }}
                variant="bodyLarge"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}>
                {formatDurationMinsSecs(lastKilometerDuration)}
              </Text>
            </View>

            <View style={styles.barColumn}>
              <View style={[styles.barTrack, { backgroundColor: colors.surfaceVariant }]}>
                <View
                  style={[
                    styles.bar,
                    { backgroundColor: colors.primary, width: `${(fastestKm / lastKilometerDuration) * 100}%` },
                  ]}
                />
              </View>
            </View>
            <View style={styles.elevationColumn}>
              <Text style={{ color: colors.onSurface }} variant="bodyLarge">
                {Number.isFinite(lastKilometerAltitude) ? Math.max(0, lastKilometerAltitude).toFixed(1) : '—'}
              </Text>
            </View>
          </View>
          <Divider style={{ backgroundColor: colors.outlineVariant }} />
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
  kmColumn: { flex: 2 },
  paceColumn: { flex: 15 },
  durationColumn: { flex: 1.5, minWidth: 42 },
  barColumn: { flex: 13.5, justifyContent: 'center', paddingHorizontal: 8 },
  elevationColumn: { alignItems: 'flex-end', flex: 3 },
  barTrack: { borderRadius: 4, height: 8, overflow: 'hidden', width: '100%' },
  bar: { borderRadius: 4, height: '100%' },
});
