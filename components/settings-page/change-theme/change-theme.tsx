import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { TouchableRipple, useTheme, Text, Divider } from 'react-native-paper';
import ChangeThemeModal from '../change-theme-modal/change-theme-modal';

export default function ChangeTheme() {
  const { dark } = useTheme();
  const themesModalRef = useRef<BottomSheetModal>(null);
  return (
    <>
      <TouchableRipple
        rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
        borderless
        onPress={() => themesModalRef.current?.present()}
        style={{ padding: 10 }}>
        <Text variant="titleMedium">Тема оформления</Text>
      </TouchableRipple>
      <Divider />
      <ChangeThemeModal themesModalRef={themesModalRef} />
    </>
  );
}
