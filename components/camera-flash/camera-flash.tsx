import { FlashMode } from 'expo-camera';
import { Pressable } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';

type CameraFlashProps = {
  setFlashEnable: (arg: FlashMode) => void;
  flashEnable: FlashMode;
};

export default function CameraFlash({ setFlashEnable, flashEnable }: CameraFlashProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => setFlashEnable(flashEnable === 'off' ? 'on' : 'off')}
      testID="cameraFlashTestId"
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
      <Icon source="flash" size={50} color={colors.primaryContainer} />
    </Pressable>
  );
}
