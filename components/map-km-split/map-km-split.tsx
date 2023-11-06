import { Callout, PointAnnotation } from '@rnmapbox/maps';
import { View, StyleSheet } from 'react-native';

import { KilometresSplit } from '../home-activity-full-view-km-split/home-activity-full-view-km-split';

export default function MapKmSplit({ kilometresSplit }: { kilometresSplit: KilometresSplit[] }) {
  return (
    <>
      {kilometresSplit?.length > 0
        ? kilometresSplit?.map(({ kilometerPoint }, index) => {
            const {
              coords: { longitude, latitude },
            } = kilometerPoint;
            return (
              <PointAnnotation
                key={`${index}/${longitude}, ${latitude}`}
                coordinate={[longitude, latitude]}
                id={`${index}/${longitude}, ${latitude}`}>
                <View style={styles.customKm} />
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
    height: 20,
    width: 20,
    backgroundColor: 'blue',
    borderColor: 'orange',
    borderWidth: 2,
    borderRadius: 50,
  },
});
