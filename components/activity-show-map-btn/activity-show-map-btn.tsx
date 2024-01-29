import { setIsMapVisible } from '@R/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { FontAwesome } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { ACTIVITY_SHOW_MAP_TEST_ID } from './const';

export default function ActivityShowMapBtn() {
  const dispatch = useAppDispatch();
  const { isMapVisible } = useAppSelector(({ location }) => location);
  return (
    <Pressable
      testID={ACTIVITY_SHOW_MAP_TEST_ID}
      style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }, styles.showMapBtn]}
      onPress={() => dispatch(setIsMapVisible(!isMapVisible))}>
      <FontAwesome name="map-marker" size={25} color="white" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  showMapBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    borderRadius: 50,
    width: 50,
    height: 50,
  },
});
