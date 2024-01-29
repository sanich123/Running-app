import { setActivityStatus } from '@R/location/location';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { STATUSES, LANGUAGES } from '@const/enums';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { ACTIVITY_PAUSE_BTN } from './const';

const { paused, continued } = STATUSES;

export default function ActivityPauseBtn() {
  const dispatch = useAppDispatch();
  const { activityStatus } = useAppSelector(({ location }) => location);
  const { language } = useAppSelector(({ language }) => language);
  const isRussianText = language === LANGUAGES.russian;
  return (
    <View style={styles.layout}>
      <Pressable
        style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }, styles.btnStyle]}
        onPress={() => dispatch(setActivityStatus(activityStatus === paused ? continued : paused))}>
        <Text style={[styles.textStyle, isRussianText && { fontSize: 15 }]}>{ACTIVITY_PAUSE_BTN[language].resume}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    flexDirection: 'row',
    gap: 20,
  },
  btnStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    borderRadius: 50,
    width: 90,
    height: 90,
  },
  textStyle: {
    fontSize: 22,
    textTransform: 'uppercase',
    color: 'white',
  },
});
