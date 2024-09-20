import { BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { TouchableRipple, useTheme, Text, Divider } from 'react-native-paper';
import ChangeThemeModal from '../change-theme-modal/change-theme-modal';
import { useAppSelector } from '@R/typed-hooks';
import { LANGUAGES } from '@const/enums';

export default function ChangeTheme() {
  const { dark } = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  const themesModalRef = useRef<BottomSheetModal>(null);
  const { dismiss } = useBottomSheetModal();
  const isRussian = language === LANGUAGES.russian;
  return (
    <>
      <TouchableRipple
        rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
        borderless
        onPress={() => {
          dismiss();
          themesModalRef.current?.present();
        }}
        style={{ padding: 10 }}>
        <Text variant="titleMedium">{isRussian ? 'Тема' : 'Theme'}</Text>
      </TouchableRipple>
      <Divider />
      <ChangeThemeModal themesModalRef={themesModalRef} />
    </>
  );
}
