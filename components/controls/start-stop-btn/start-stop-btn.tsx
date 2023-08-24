import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLinkTo } from '@react-navigation/native';
import { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { STATUSES } from '../../../constants/enums';
import { LANGUAGE } from '../../../constants/languages/languages';
import { useAppSelector } from '../../../redux/hooks/hooks';
import { Text } from '../../Themed';

type StartStopBtnProps = {
  status: STATUSES;
  setStatus: (arg: STATUSES) => void;
};

export default function StartStopBtn({ setStatus, status }: StartStopBtnProps) {
  const { startBtn, textStyle } = styles;
  const { language } = useAppSelector(({ changeThemeLang }) => changeThemeLang);
  const linkTo = useLinkTo();

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
          linkTo('/(tabs)/activity/save-activity');
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
