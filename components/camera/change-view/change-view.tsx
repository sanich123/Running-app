import { Icon, TouchableRipple, useTheme } from 'react-native-paper';

import { CameraTypes, ChangeViewProps } from '../types';

export default function ChangeView({ type, setType }: ChangeViewProps) {
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
