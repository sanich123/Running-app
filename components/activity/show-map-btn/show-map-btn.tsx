import { setIsMapVisible } from '@R/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { TouchableRipple, useTheme } from 'react-native-paper';

import { ACTIVITY_SHOW_MAP_TEST_ID } from './const';

export default function ShowMapBtn() {
  const { colors, dark } = useTheme();
  const dispatch = useAppDispatch();
  const { isMapVisible } = useAppSelector(({ location }) => location);
  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      style={{ borderRadius: 50 }}
      testID={ACTIVITY_SHOW_MAP_TEST_ID}
      onPress={() => dispatch(setIsMapVisible(!isMapVisible))}>
      <View style={[styles.showMapBtn, { backgroundColor: colors.error }]}>
        <FontAwesome name="map-marker" size={25} color="white" />
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  showMapBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 55,
    width: 55,
  },
});
