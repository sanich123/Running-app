import { Callout, PointAnnotation } from '@rnmapbox/maps';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import type { LastKmSplit } from '@R/slices/location/types';

export default function MapKmSplit({ kilometresSplit }: { kilometresSplit: LastKmSplit[] }) {
  return (
    <>
      {kilometresSplit?.length > 0
        ? kilometresSplit
            .filter((split) => Boolean(split?.kilometerPoint?.coords))
            .map(({ kilometerPoint }, index) => {
              if (!kilometerPoint?.coords) {
                return null;
              }
              const {
                coords: { longitude, latitude },
              } = kilometerPoint;
              const key = `${index}/${longitude},${latitude}`;
              return (
                <PointAnnotation key={key} coordinate={[longitude, latitude]} id={key}>
                  <View style={[styles.customKm]}>
                    <Text variant="bodySmall" style={{ color: 'black' }}>
                      {index + 1}
                    </Text>
                  </View>
                  <Callout title={`${index + 1} kilometer`} />
                </PointAnnotation>
              );
            })
        : null}
    </>
  );
}

const styles = StyleSheet.create({
  customKm: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
    width: 20,
    backgroundColor: 'white',
    borderColor: 'orange',
    borderWidth: 1,
    borderRadius: 50,
  },
});
