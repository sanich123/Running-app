import { StyleSheet } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { LANGUAGE_SWITCHER_COPY } from './const';
import SettingsRow from '../settings-row/settings-row';

export default function LanguageSwitcher() {
  const { language } = useAppSelector(({ settings }) => settings);
  const dispatch = useAppDispatch();
  const copy = LANGUAGE_SWITCHER_COPY[language];

  return (
    <SettingsRow
      testID="language-switcher-row"
      icon="translate"
      title={copy.title}
      description={copy.description}
      right={
        <SegmentedButtons<LANGUAGES>
          value={language}
          onValueChange={(value) => dispatch(changeLanguage(value))}
          density="small"
          style={styles.segmentedButtons}
          buttons={[
            {
              value: LANGUAGES.russian,
              label: 'RU',
              accessibilityLabel: copy.russianLanguageName,
              testID: 'language-russian',
            },
            {
              value: LANGUAGES.english,
              label: 'EN',
              accessibilityLabel: copy.englishLanguageName,
              testID: 'language-english',
            },
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
