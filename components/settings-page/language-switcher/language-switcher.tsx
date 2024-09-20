import { useRef } from 'react';
import { Divider, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import LanguageSwitcherModal from '../language-switcher-modal/language-switcher-modal';
import { LANGUAGES } from '@const/enums';

export default function LanguageSwitcher() {
  const { language } = useAppSelector(({ language }) => language);
  const { dark } = useTheme();
  const languagesModalRef = useRef<BottomSheetModal>(null);
  return (
    <>
      <TouchableRipple
        rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
        borderless
        onPress={() => languagesModalRef.current?.present()}
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: 10,
        }}>
        <Text variant="titleMedium">{`${language === LANGUAGES.russian ? 'Язык' : 'Language'}`}</Text>
      </TouchableRipple>
      <Divider />
      <LanguageSwitcherModal languagesModalRef={languagesModalRef} />
    </>
  );
}
