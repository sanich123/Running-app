import { setActivityStatus } from '@R/location/location';
import { STATUSES, LANGUAGES } from '@const/enums';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { ACTIVITY_PAUSE_BTN } from './const';

const { paused, continued } = STATUSES;

export default function ActivityPauseBtn() {
  const dispatch = useDispatch();
  const { activityStatus } = useSelector(({ location }) => location);
  const { language } = useSelector(({ language }) => language);
  const isRussianText = language === LANGUAGES.russian;
  return (
    <View style={styles.layout}>
      <Pressable
        style={styles.btnStyle}
        onPress={() => dispatch(setActivityStatus(activityStatus === paused ? continued : paused))}>
        <Text style={[styles.textStyle, isRussianText && { fontSize: 15 }]}>
          {ACTIVITY_PAUSE_BTN[language as keyof typeof ACTIVITY_PAUSE_BTN].resume}
        </Text>
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
