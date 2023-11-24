import { setCameraIsVisible } from '@R/activity/activity';
import { Pressable } from 'react-native';
import { useTheme, Icon } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function CameraCloseBtn() {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  return (
    <Pressable
      onPress={() => dispatch(setCameraIsVisible(false))}
      style={{ marginLeft: 'auto', marginTop: 50 }}
      testID="cameraCloseBtn">
      <Icon source="close" size={50} color={colors.primaryContainer} />
    </Pressable>
  );
}
