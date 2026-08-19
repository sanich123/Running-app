import { View, StyleSheet } from 'react-native';
import { Icon, TouchableRipple, useTheme } from 'react-native-paper';
import { setIsMapVisible } from '@R/slices/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { ACTIVITY_SHOW_MAP_TEST_ID } from './const';

export default function ShowMapBtn() {
  const { dark, colors } = useTheme();
  const dispatch = useAppDispatch();
  const { isMapVisible } = useAppSelector(({ location }) => location);
  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      style={styles.touchable}
      testID={ACTIVITY_SHOW_MAP_TEST_ID}
      onPress={() => dispatch(setIsMapVisible(!isMapVisible))}>
      <View style={[styles.showMapBtn, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
        <Icon source={isMapVisible ? 'map-marker-off' : 'map-marker'} size={25} color={colors.primary} />
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  showMapBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 58,
    width: 58,
    borderRadius: 29,
    borderWidth: 1,
  },
  touchable: {
    borderRadius: 29,
  },
});
