import { StyleSheet, Pressable } from 'react-native';
import { View, Text } from '../Themed';
import { STATUSES } from '../../constants/enums';
import StartBtn from '../start-stop-btn/start-stop-btn';
import { FontAwesome } from '@expo/vector-icons';

type StartStopPauseBtnsProps = {
  status: STATUSES;
  setStatus: (arg: STATUSES) => void;
};

export default function StartStopPauseBtns({ status, setStatus }: StartStopPauseBtnsProps) {
  const { containerStartBtn, containerPauseStopBtns, textStyle, startBtn } = styles;
  return (
    <View style={containerStartBtn}>
      {status === STATUSES.paused && (
        <View style={containerPauseStopBtns}>
          <Pressable style={startBtn} onPress={() => setStatus(status === STATUSES.paused ? STATUSES.continue : STATUSES.paused)}>
            <Text style={textStyle}>{status === STATUSES.paused ? 'Resume' : 'Pause'}</Text>
          </Pressable>
        </View>
      )}

      <StartBtn status={status} setStatus={setStatus} />
      {(status === STATUSES.paused || status === STATUSES.started) && (
        <Pressable style={[startBtn, { width: 50, height: 50 }]}>
          <FontAwesome name="map-marker" size={25} color={'white'} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerStartBtn: {
    height: '40%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  startBtn: {
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
  },
  containerPauseStopBtns: {
    flexDirection: 'row',
    gap: 20,
  },
});
