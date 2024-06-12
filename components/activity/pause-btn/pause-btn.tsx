import { setActivityStatus } from '@R/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { STATUSES } from '@const/enums';
import { View, StyleSheet } from 'react-native';
import { TouchableRipple, useTheme, Icon } from 'react-native-paper';

export default function PauseBtn() {
  const { dark } = useTheme();
  const dispatch = useAppDispatch();
  const { activityStatus } = useAppSelector(({ location }) => location);

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      style={{ borderRadius: 50 }}
      onPress={() =>
        dispatch(setActivityStatus(activityStatus === STATUSES.paused ? STATUSES.continued : STATUSES.paused))
      }>
      <View style={styles.pauseBtn}>
        <Icon source="play" size={50} color="white" />
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  pauseBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'tomato',
    height: 90,
    width: 90,
  },
});
