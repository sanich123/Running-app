import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { formatDurationMinsSecs } from '@U/time-formatter';
import { KM_SPLITS } from './const';
import type { LastKmSplit } from '@R/slices/location/types';

export default function KmSplit({ kilometresSplit }: { kilometresSplit: LastKmSplit[] }) {
  const validSplits = (Array.isArray(kilometresSplit) ? kilometresSplit : []).filter(
    (split) => Number.isFinite(split?.lastKilometerDuration) && split.lastKilometerDuration > 0,
  );
  const fastestKm = validSplits.length
    ? Math.min(...validSplits.map(({ lastKilometerDuration }) => lastKilometerDuration))
    : 0;
  const { language } = useAppSelector(({ language }) => language);

  return (
    <>
      <Text variant="titleLarge" style={styles.title}>
        {KM_SPLITS[language].splits}
      </Text>
      <View style={styles.headerRow}>
        <View style={{ flex: 2 }}>
          <Text variant="labelMedium" style={styles.headerText}>
            {KM_SPLITS[language].km}
          </Text>
        </View>
        <View style={{ flex: 16 }}>
          <Text variant="labelMedium" style={styles.headerText}>
            {KM_SPLITS[language].pace}
          </Text>
        </View>
        <View style={{ display: 'flex' }}>
          <Text variant="labelMedium" style={styles.headerText}>
            {KM_SPLITS[language].elev}
          </Text>
        </View>
      </View>
      {validSplits.map(({ lastKilometerAltitude, lastKilometerDuration }, index) => (
        <Fragment key={`${lastKilometerAltitude}/${lastKilometerDuration}/${index}`}>
          <View
            style={{ flex: 1, flexDirection: 'row', width: '100%', paddingTop: 5 }}
            key={`${index}/${lastKilometerAltitude * lastKilometerDuration}`}>
            <View style={{ flex: 2 }}>
              <Text style={{ width: '100%' }} variant="bodyLarge">
                {index + 1}
              </Text>
            </View>
            <View style={{ flex: 3, justifyContent: 'center' }}>
              <Text style={{ flex: 1, width: '100%' }} variant="bodyLarge">
                {formatDurationMinsSecs(lastKilometerDuration)}
              </Text>
            </View>

            <View style={{ flex: 12 }}>
              <View
                style={{ flex: 1, backgroundColor: 'red', width: `${(fastestKm / lastKilometerDuration) * 100}%` }}
              />
            </View>
            <View style={{ flex: 3 }}>
              <Text style={{ flex: 1, marginLeft: 'auto' }} variant="bodyLarge">
                {Number.isFinite(lastKilometerAltitude) ? lastKilometerAltitude.toFixed(1) : '—'}
              </Text>
            </View>
          </View>
          <Divider />
        </Fragment>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '800', paddingBottom: 16, paddingTop: 12 },
  headerRow: { flex: 1, flexDirection: 'row', width: '100%', paddingBottom: 12 },
  headerText: { fontWeight: '800' },
});
