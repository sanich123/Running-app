import { FlashMode } from 'expo-camera';
import { Icon, TouchableRipple, useTheme } from 'react-native-paper';

import { FlashModes } from '../enums';

type FlashBtnProps = {
  setFlashEnable: (arg: FlashMode) => void;
  flashEnable: FlashMode;
};

export default function FlashBtn({ setFlashEnable, flashEnable }: FlashBtnProps) {
  const { colors, dark } = useTheme();
  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      onPress={() => setFlashEnable(flashEnable === FlashModes.off ? FlashModes.on : FlashModes.off)}
      testID="FlashBtnTestId">
      <Icon source="flash" size={50} color={colors.primaryContainer} />
    </TouchableRipple>
  );
}
