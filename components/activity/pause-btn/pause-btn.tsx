import { setActivityStatus } from '@R/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { STATUSES } from '@const/enums';
import { View, StyleSheet } from 'react-native';
import { TouchableRipple, useTheme, Text } from 'react-native-paper';

import { ACTIVITY_PAUSE_BTN } from './const';

export default function PauseBtn() {
  const { dark, colors } = useTheme();
  const dispatch = useAppDispatch();
  const { activityStatus } = useAppSelector(({ location }) => location);
  const { language } = useAppSelector(({ language }) => language);

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      style={{ borderRadius: 50 }}
      onPress={() =>
        dispatch(setActivityStatus(activityStatus === STATUSES.paused ? STATUSES.continued : STATUSES.paused))
      }>
      <View style={[styles.pauseBtn, { backgroundColor: colors.error }]}>
        <Text variant="bodyLarge" style={styles.pauseBtnText}>
          {ACTIVITY_PAUSE_BTN[language].resume}
        </Text>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  pauseBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 95,
    width: 95,
  },
  pauseBtnText: {
    textTransform: 'uppercase',
    color: 'white',
  },
});
