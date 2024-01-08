import { useAppSelector } from '@R/typed-hooks';
import { PointAnnotation } from '@rnmapbox/maps';
import { StyleSheet } from 'react-native';

import { View } from '../Themed';

export default function MapNavIcon() {
  const { lastPosition, initialLocation } = useAppSelector(({ location }) => location);
  return (
    <>
      {initialLocation?.coords ? (
        <PointAnnotation
          coordinate={
            lastPosition
              ? [lastPosition.coords.longitude, lastPosition.coords.latitude]
              : [initialLocation.coords.longitude, initialLocation.coords.latitude]
          }
          id="home">
          <View style={styles.customHome} />
        </PointAnnotation>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  customHome: {
    height: 20,
    width: 20,
    backgroundColor: 'yellow',
    borderColor: 'orange',
    borderWidth: 2,
    borderRadius: 50,
  },
});
