import { setIsMapVisible } from '@R/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { FontAwesome } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { ACTIVITY_SHOW_MAP_TEST_ID } from './const';

export default function ActivityShowMapBtn() {
  const dispatch = useAppDispatch();
  const { isMapVisible } = useAppSelector(({ location }) => location);
  return (
    <Pressable
      testID={ACTIVITY_SHOW_MAP_TEST_ID}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
      onPress={() => dispatch(setIsMapVisible(!isMapVisible))}>
      <View className="flex items-center justify-center w-14 height-14 bg-red-500 rounded-full py-3.5">
        <FontAwesome name="map-marker" size={25} color="white" />
      </View>
    </Pressable>
  );
}
