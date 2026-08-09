import { IconButton } from 'react-native-paper';
import { CameraTypes } from '../types';
import type { ChangeViewProps } from '../types';

export default function ChangeView({ type, setType }: ChangeViewProps) {
  return (
    <IconButton
      icon="camera-switch"
      mode="contained-tonal"
      size={24}
      iconColor="#fff"
      containerColor="rgba(0, 0, 0, 0.45)"
      onPress={() => setType(type === CameraTypes.back ? CameraTypes.front : CameraTypes.back)}
      testID="changeViewBtnTestId"
      accessibilityLabel="Переключить камеру"
    />
  );
}
