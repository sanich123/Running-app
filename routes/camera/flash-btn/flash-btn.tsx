import { IconButton } from 'react-native-paper';
import { FlashModes } from '../types';
import type { FlashBtnProps } from '../types';

export default function FlashBtn({ setFlashEnable, flashEnable }: FlashBtnProps) {
  return (
    <IconButton
      icon={flashEnable === FlashModes.off ? 'flash-off' : 'flash'}
      mode="contained-tonal"
      size={24}
      iconColor="#fff"
      containerColor="rgba(0, 0, 0, 0.45)"
      onPress={() => setFlashEnable(flashEnable === FlashModes.off ? FlashModes.on : FlashModes.off)}
      testID="FlashBtnTestId"
      accessibilityLabel="Переключить вспышку"
    />
  );
}
