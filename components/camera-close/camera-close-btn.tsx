import { Pressable } from 'react-native';
import { useTheme, Icon } from 'react-native-paper';

export default function CameraCloseBtn({ setIsCameraVisible }: { setIsCameraVisible: (arg: boolean) => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={() => setIsCameraVisible(false)} style={{ marginLeft: 'auto' }}>
      <Icon source="close" size={50} color={colors.primaryContainer} />
    </Pressable>
  );
}
