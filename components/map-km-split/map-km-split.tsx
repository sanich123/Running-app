import { KilometresSplit } from '@C/home-activity-full-view-km-split/home-activity-full-view-km-split';
import { Callout, PointAnnotation } from '@rnmapbox/maps';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function MapKmSplit({ kilometresSplit }: { kilometresSplit: KilometresSplit[] }) {
  return (
    <>
      {kilometresSplit?.length > 0
        ? kilometresSplit?.map(({ kilometerPoint }, index) => {
            const {
              coords: { longitude, latitude },
            } = kilometerPoint;
            const key = `${index}/${longitude},${latitude}`;
            return (
              <PointAnnotation key={key} coordinate={[longitude, latitude]} id={key}>
                <View style={styles.customKm}>
                  <Text variant="bodySmall">{index + 1}</Text>
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
    borderColor: 'orange',
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 50,
  },
});
