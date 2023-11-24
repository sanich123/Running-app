import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { SHOW_CAMERA_BTN } from './const';
import { setCameraIsVisible } from '../../redux/activity/activity';

export default function ShowCameraBtn({ isDisabled }: { isDisabled: boolean }) {
  const dispatch = useDispatch();
  const { language } = useSelector(({ language }) => language);
  const { isDisabledWhileSending } = useSelector(({ activity }) => activity);

  return (
    <Button
      mode="outlined"
      icon="camera"
      style={styles.showCameraBtn}
      onPress={() => dispatch(setCameraIsVisible(true))}
      disabled={isDisabledWhileSending || isDisabled}>
      {SHOW_CAMERA_BTN[language as keyof typeof SHOW_CAMERA_BTN].text}
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
