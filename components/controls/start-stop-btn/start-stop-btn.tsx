import { Text } from '@c/Themed';
import { STATUSES } from '@const/enums';
import { LANGUAGE } from '@const/languages/languages';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppSelector } from '@r/hooks/hooks';
import { saveFinishedActivity } from '@r/location-slice/location-slice';
import { ActivityComponentContext } from '@u/context/activity-component';
import { getTotalSpeed } from '@u/location-utils';
import { useRouter } from 'expo-router';
import { ReactNode, useContext } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';

export default function StartStopBtn() {
  const { setStatus, status, locations, duration, distance } = useContext(ActivityComponentContext);
  const dispatch = useDispatch();
  const { startBtn, textStyle } = styles;
  const { language } = useAppSelector(({ changeThemeLang }) => changeThemeLang);
  const router = useRouter();

  const responseStatus: { [key in STATUSES]: STATUSES } = {
    [STATUSES.initial]: STATUSES.started,
    [STATUSES.started]: STATUSES.paused,
    [STATUSES.paused]: STATUSES.initial,
    [STATUSES.continue]: STATUSES.paused,
  };

  const responseIcon: { [key in STATUSES]: string | ReactNode } = {
    [STATUSES.initial]: LANGUAGE[language].activity.controlBtns.start,
    [STATUSES.started]: <FontAwesome name="stop" size={25} style={{ marginRight: 15 }} />,
    [STATUSES.paused]: LANGUAGE[language].activity.controlBtns.finish,
    [STATUSES.continue]: <FontAwesome name="stop" size={25} style={{ marginRight: 15 }} />,
  };

  return (
    <Pressable
      style={startBtn}
      onPress={() => {
        setStatus(responseStatus[status]);
        if (status === STATUSES.paused) {
          dispatch(saveFinishedActivity({ locations, duration, speed: getTotalSpeed(distance, duration), distance }));
          router.push('/(tabs)/save-activity/');
        }
      }}>
      <Text style={textStyle}>{responseIcon[status]}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  startBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    borderRadius: 50,
    width: 90,
    height: 90,
  },
  textStyle: {
    fontSize: 28,
    textTransform: 'uppercase',
    color: 'white',
  },
});
