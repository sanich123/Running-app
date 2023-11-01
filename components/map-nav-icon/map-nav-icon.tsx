import { PointAnnotation } from '@rnmapbox/maps';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { View } from '../Themed';

export default function NavIcon() {
  const { lastPosition, initialLocation } = useSelector(({ location }) => location);
  const lastView = lastPosition
    ? [lastPosition?.coords.longitude, lastPosition?.coords.latitude]
    : [initialLocation?.coords.longitude, initialLocation?.coords.latitude];
  return (
    <>
      {lastPosition || initialLocation ? (
        <PointAnnotation coordinate={lastView} id="home">
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
