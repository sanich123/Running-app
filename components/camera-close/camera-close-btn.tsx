import { setCameraIsVisible } from '@R/activity/activity';
import { useAppDispatch } from '@R/typed-hooks';
import { Pressable } from 'react-native';
import { useTheme, Icon } from 'react-native-paper';

export default function CameraCloseBtn() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  return (
    <Pressable
      onPress={() => dispatch(setCameraIsVisible(false))}
      testID="cameraCloseBtn"
      style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }, { marginLeft: 'auto', marginTop: 50 }]}>
      <Icon source="close" size={50} color={colors.primaryContainer} />
    </Pressable>
  );
}
