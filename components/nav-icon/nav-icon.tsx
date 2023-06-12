import { PointAnnotation, Callout } from '@rnmapbox/maps';
import { View } from '../Themed';
import { StyleSheet } from 'react-native';

export default function NavIcon({ lastView }: { lastView: number[] }) {
  return (
    <PointAnnotation key={Math.random().toString()} coordinate={lastView} id="home">
      <View style={styles.customHome} />
      <Callout title={`Координаты ${lastView[0]}, ${lastView[1]}`} />
    </PointAnnotation>
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
