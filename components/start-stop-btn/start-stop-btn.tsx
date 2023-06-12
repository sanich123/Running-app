import { STATUSES } from '../../constants/enums';
import { Text } from '../Themed';
import { Pressable, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type StartStopBtnProps = {
  status: STATUSES;
  setStatus: (arg: STATUSES) => void;
};

export default function StartStopBtn({ setStatus, status }: StartStopBtnProps) {
  const { startBtn, textStyle } = styles;

  const responseStatus: { [key in STATUSES]: STATUSES } = {
    [STATUSES.initial]: STATUSES.started,
    [STATUSES.started]: STATUSES.paused,
    [STATUSES.paused]: STATUSES.stopped,
    [STATUSES.continue]: STATUSES.paused,
    [STATUSES.stopped]: STATUSES.initial,
  };

  const responseIcon: { [key in STATUSES]: string | React.ReactNode } = {
    [STATUSES.initial]: 'Start',
    [STATUSES.started]: <FontAwesome name="stop" size={25} style={{ marginRight: 15 }} />,
    [STATUSES.paused]: 'Finish',
    [STATUSES.continue]: <FontAwesome name="stop" size={25} style={{ marginRight: 15 }} />,
    [STATUSES.stopped]: 'Start',
  };

  return (
    <Pressable style={startBtn} onPress={() => setStatus(responseStatus[status])}>
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
  },
});
