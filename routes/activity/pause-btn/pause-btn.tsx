import { useState } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { TouchableRipple, useTheme, Icon } from 'react-native-paper';
import { STATUSES } from '@const/enums';
import { setActivityStatus } from '@R/slices/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';

export default function PauseBtn() {
  const { dark, colors } = useTheme();
  const dispatch = useAppDispatch();
  const { activityStatus } = useAppSelector(({ location }) => location);
  const [pressScale] = useState(() => new Animated.Value(1));

  return (
    <TouchableRipple
      testID="activity-pause-toggle"
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      style={styles.touchable}
      onPressIn={() =>
        Animated.spring(pressScale, { toValue: 0.94, useNativeDriver: true, speed: 30, bounciness: 4 }).start()
      }
      onPressOut={() =>
        Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start()
      }
      onPress={() =>
        dispatch(setActivityStatus(activityStatus === STATUSES.paused ? STATUSES.continued : STATUSES.paused))
      }>
      <Animated.View style={{ transform: [{ scale: pressScale }] }}>
        <View style={[styles.pauseBtn, { backgroundColor: colors.primaryContainer }]}>
          <Icon source="play" size={30} color={colors.primary} />
        </View>
      </Animated.View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 38,
  },
  pauseBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 72,
    width: 72,
    borderRadius: 36,
  },
});
