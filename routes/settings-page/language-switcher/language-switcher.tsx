import { useRef } from 'react';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import LanguageSwitcherModal from '../language-switcher-modal/language-switcher-modal';
import SettingsRow from '../settings-row/settings-row';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function LanguageSwitcher() {
  const { language } = useAppSelector(({ language }) => language);
  const languagesModalRef = useRef<BottomSheetModal>(null);
  return (
    <>
      <SettingsRow
        testID="language-switcher-row"
        icon="translate"
        title={language === LANGUAGES.russian ? 'Язык' : 'Language'}
        description={language === LANGUAGES.russian ? 'Выберите язык приложения' : 'Choose app language'}
        onPress={() => languagesModalRef.current?.present()}
      />
      <LanguageSwitcherModal languagesModalRef={languagesModalRef} />
    </>
  );
}
