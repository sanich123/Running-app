import { setIsMapVisible } from '@R/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { FontAwesome } from '@expo/vector-icons';
import { View } from 'react-native';
import { TouchableRipple, useTheme } from 'react-native-paper';

import { ACTIVITY_SHOW_MAP_TEST_ID } from './const';

export default function ShowMapBtn() {
  const { dark } = useTheme();
  const dispatch = useAppDispatch();
  const { isMapVisible } = useAppSelector(({ location }) => location);
  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      style={{ borderRadius: 50 }}
      testID={ACTIVITY_SHOW_MAP_TEST_ID}
      onPress={() => dispatch(setIsMapVisible(!isMapVisible))}>
      <View className="flex items-center justify-center w-14 height-14 bg-red-500 rounded-full py-3.5">
        <FontAwesome name="map-marker" size={25} color="white" />
      </View>
    </TouchableRipple>
  );
}
