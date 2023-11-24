import { setIsMapVisible } from '@R/location/location';
import { FontAwesome } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { ACTIVITY_SHOW_MAP_TEST_ID } from './const';

export default function ActivityShowMapBtn() {
  const dispatch = useDispatch();
  const { isMapVisible } = useSelector(({ location }) => location);
  return (
    <Pressable
      testID={ACTIVITY_SHOW_MAP_TEST_ID}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'red',
        borderRadius: 50,
        width: 50,
        height: 50,
      }}
      onPress={() => dispatch(setIsMapVisible(!isMapVisible))}>
      <FontAwesome name="map-marker" size={25} color="white" />
    </Pressable>
  );
}
