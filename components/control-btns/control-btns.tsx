import { StyleSheet, Pressable } from 'react-native';
import { View, Text } from '../Themed';
import { STATUSES } from '../../constants/enums';
import StartBtn from '../start-stop-btn/start-stop-btn';
import { FontAwesome } from '@expo/vector-icons';
import { LANGUAGE } from '../../constants/languages/languages';
import { useAppSelector } from '../../redux/hooks/hooks';

type ControlBtnsProps = {
  status: STATUSES;
  setStatus: (arg: STATUSES) => void;
  setMapVisible: (arg: boolean) => void;
  mapVisible: boolean;
};

export default function ControlBtns({ status, setStatus, setMapVisible, mapVisible }: ControlBtnsProps) {
  const { containerStartBtn, containerPauseStopBtns, textStyle, pinBtn } = styles;
  const { language } = useAppSelector(({ changeThemeLang }) => changeThemeLang);

  return (
    <View style={containerStartBtn}>
      {status === STATUSES.paused && (
        <View style={containerPauseStopBtns}>
          <Pressable
            style={pinBtn}
            onPress={() => {
              setStatus(status === STATUSES.paused ? STATUSES.continue : STATUSES.paused);
              setMapVisible(false);
            }}
          >
            <Text style={textStyle}>{LANGUAGE[language].activity.controlBtns.resume}</Text>
          </Pressable>
        </View>
      )}

      <StartBtn status={status} setStatus={setStatus} />
      {(status === STATUSES.started || status === STATUSES.continue) && (
        <Pressable style={[pinBtn, { width: 50, height: 50 }]} onPress={() => setMapVisible(!mapVisible)}>
          <FontAwesome name="map-marker" size={25} color={'white'} />
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
