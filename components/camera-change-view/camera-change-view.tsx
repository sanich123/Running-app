import { CameraType } from 'expo-camera';
import { Pressable } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';

type CamerChangeViewProps = {
  type: CameraType;
  setType: (arg: CameraType) => void;
};

export default function CameraChangeView({ setType, type }: CamerChangeViewProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => setType(type === CameraType.back ? CameraType.front : CameraType.back)}
      testID="changeViewBtnTestId"
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
      <Icon source="swap-horizontal-bold" size={50} color={colors.primaryContainer} />
    </Pressable>
  );
}
