import { CameraType } from 'expo-camera';
import { Icon, TouchableRipple, useTheme } from 'react-native-paper';

import { CameraTypes } from '../enums';

export default function ChangeView({ type, setType }: { type: CameraType; setType: (arg: CameraType) => void }) {
  const { colors, dark } = useTheme();

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      onPress={() => setType(type === CameraTypes.back ? CameraTypes.front : CameraTypes.back)}
      testID="changeViewBtnTestId">
      <Icon source="swap-horizontal-bold" size={50} color={colors.primaryContainer} />
    </TouchableRipple>
  );
}
