import { View, Text } from '@c/Themed';
import StartBtn from '@c/controls/start-stop-btn/start-stop-btn';
import { STATUSES } from '@const/enums';
import { LANGUAGE } from '@const/languages/languages';
import { FontAwesome } from '@expo/vector-icons';
import { useAppSelector } from '@r/hooks/hooks';
import { ActivityComponentContext } from '@u/context/activity-component';
import { useContext } from 'react';
import { StyleSheet, Pressable } from 'react-native';

export default function Controls() {
  const { setStatus, setMapVisible, mapVisible, status } = useContext(ActivityComponentContext);
  const { containerStartBtn, containerPauseStopBtns, textStyle, pinBtn } = styles;
  const { language } = useAppSelector(({ changeThemeLang }) => changeThemeLang);
  const paused = status === STATUSES.paused;
  const isStartedOrContinue = status === STATUSES.started || status === STATUSES.continue;

  return (
    <View style={containerStartBtn}>
      {paused && (
        <View style={containerPauseStopBtns}>
          <Pressable
            style={pinBtn}
            onPress={() => {
              setStatus(paused ? STATUSES.continue : STATUSES.paused);
              setMapVisible(false);
            }}>
            <Text style={textStyle}>{LANGUAGE[language].activity.controlBtns.resume}</Text>
          </Pressable>
        </View>
      )}

      <StartBtn />

      {isStartedOrContinue && (
        <Pressable style={[pinBtn, { width: 50, height: 50 }]} onPress={() => setMapVisible(!mapVisible)}>
          <FontAwesome name="map-marker" size={25} color="white" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  containerStartBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    gap: 15,
  },
  pinBtn: {
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
  containerPauseStopBtns: {
    flexDirection: 'row',
    gap: 20,
  },
});
