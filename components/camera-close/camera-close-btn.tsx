import { setCameraIsVisible } from '@R/activity/activity';
import { useAppDispatch } from '@R/typed-hooks';
import { Pressable, View } from 'react-native';
import { useTheme, Icon } from 'react-native-paper';

export default function CameraCloseBtn() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  return (
    <Pressable
      onPress={() => dispatch(setCameraIsVisible(false))}
      testID="cameraCloseBtn"
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
      <View style={{ marginLeft: 'auto', marginTop: 50, marginRight: 10 }}>
        <Icon source="close" size={50} color={colors.primaryContainer} />
      </View>
    </Pressable>
  );
}
