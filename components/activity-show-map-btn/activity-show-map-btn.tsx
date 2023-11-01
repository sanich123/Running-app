import { FontAwesome } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { setIsMapVisible } from '../../redux/location/location';

export default function ActivityShowMapBtn() {
  const dispatch = useDispatch();
  const { isMapVisible } = useSelector(({ location }) => location);
  return (
    <Pressable
      testID="showMapButton"
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'red',
          borderRadius: 50,
          width: 90,
          height: 90,
        },
        { width: 50, height: 50 },
      ]}
      onPress={() => dispatch(setIsMapVisible(!isMapVisible))}>
      <FontAwesome name="map-marker" size={25} color="white" />
    </Pressable>
  );
}
