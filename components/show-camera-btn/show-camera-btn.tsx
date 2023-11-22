import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { SHOW_CAMERA_BTN } from './const';
import { setCameraIsVisible } from '../../redux/activity/activity';

export default function ShowCameraBtn() {
  const dispatch = useDispatch();
  const { language } = useSelector(({ language }) => language);
  return (
    <Button
      mode="outlined"
      icon="camera"
      style={styles.showCameraBtn}
      onPress={() => dispatch(setCameraIsVisible(true))}>
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
