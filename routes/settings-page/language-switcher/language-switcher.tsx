import { StyleSheet } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/language/language';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import SettingsRow from '../settings-row/settings-row';

export default function LanguageSwitcher() {
  const { language } = useAppSelector(({ language }) => language);
  const dispatch = useAppDispatch();

  return (
    <SettingsRow
      testID="language-switcher-row"
      icon="translate"
      title={language === LANGUAGES.russian ? 'Язык' : 'Language'}
      description={language === LANGUAGES.russian ? 'Выберите язык приложения' : 'Choose app language'}
      right={
        <SegmentedButtons<LANGUAGES>
          value={language}
          onValueChange={(value) => dispatch(changeLanguage(value))}
          density="small"
          style={styles.segmentedButtons}
          buttons={[
            { value: LANGUAGES.russian, label: 'RU', accessibilityLabel: 'Русский', testID: 'language-russian' },
            { value: LANGUAGES.english, label: 'EN', accessibilityLabel: 'English', testID: 'language-english' },
          ]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  segmentedButtons: {
    flexShrink: 0,
    width: 152,
  },
});
