import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

import { SHOW_CAMERA_BTN } from './const';
import { setCameraIsVisible } from '../../redux/activity/activity';

export default function ShowCameraBtn({ isDisabled }: { isDisabled: boolean }) {
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ language }) => language);
  const { isDisabledWhileSending } = useAppSelector(({ activity }) => activity);

  return (
    <Button
      mode="outlined"
      icon="camera"
      style={styles.showCameraBtn}
      onPress={() => dispatch(setCameraIsVisible(true))}
      disabled={isDisabledWhileSending || isDisabled}>
      {SHOW_CAMERA_BTN[language].text}
    </Button>
  );
}

const styles = StyleSheet.create({
  showCameraBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
    marginTop: 15,
  },
});
