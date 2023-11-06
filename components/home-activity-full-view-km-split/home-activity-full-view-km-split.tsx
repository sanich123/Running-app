import { LocationObject } from 'expo-location';
import { Fragment } from 'react';
import { View } from 'react-native';
import { Text, Divider } from 'react-native-paper';

import { formatDurationMinsSecs } from '../../utils/time-formatter';

export type KilometresSplit = {
  lastKilometerAltitude: number;
  lastKilometerDuration: number;
  kilometerPoint: LocationObject;
};

export default function HomeActivityFullViewKmSplit({ kilometresSplit }: { kilometresSplit: KilometresSplit[] }) {
  const fastestKm = Math.min(...kilometresSplit.map(({ lastKilometerDuration }) => lastKilometerDuration));

  return (
    <>
      <Text variant="displaySmall" style={{ paddingBottom: 20, paddingTop: 20 }}>
        Splits
      </Text>
      <View style={{ flex: 1, flexDirection: 'row', width: '100%', paddingBottom: 20 }}>
        <View style={{ flex: 2 }}>
          <Text variant="labelLarge" style={{ fontWeight: 'bold' }}>
            KM
          </Text>
        </View>
        <View style={{ flex: 16 }}>
          <Text variant="labelLarge" style={{ fontWeight: 'bold' }}>
            PACE
          </Text>
        </View>
        <View style={{ display: 'flex' }}>
          <Text variant="labelLarge" style={{ fontWeight: 'bold' }}>
            ELEV
          </Text>
        </View>
      </View>
      {kilometresSplit.map(({ lastKilometerAltitude, lastKilometerDuration }, index) => (
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
                {lastKilometerAltitude.toFixed(1)}
              </Text>
            </View>
          </View>
          <Divider />
        </Fragment>
      ))}
    </>
  );
}
