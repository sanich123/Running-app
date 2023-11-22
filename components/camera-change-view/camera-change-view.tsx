import { CameraType } from 'expo-camera';
import { Pressable } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';

export default function CameraChangeView({ setType, type }: { type: CameraType; setType: (arg: CameraType) => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => setType(type === CameraType.back ? CameraType.front : CameraType.back)}
      testID="changeViewBtnTestId">
      <Icon source="swap-horizontal-bold" size={50} color={colors.primaryContainer} />
    </Pressable>
  );
}
