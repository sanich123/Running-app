import { Appearance, StyleSheet, View } from 'react-native';
import { SegmentedButtons, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { changeTheme } from '@R/slices/language/language';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { THEMES_ARRAY } from '../change-theme-modal/const';
import SettingsRow from '../settings-row/settings-row';

export default function ChangeTheme() {
  const { colors } = useTheme();
  const { language, theme } = useAppSelector(({ language }) => language);
  const dispatch = useAppDispatch();
  const isRussian = language === LANGUAGES.russian;
  const selectedTheme = theme ?? 'system';
  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <SettingsRow
        icon="theme-light-dark"
        title={isRussian ? 'Тема' : 'Theme'}
        description={isRussian ? 'Настройте внешний вид приложения' : 'Choose how the app looks'}
      />
      <SegmentedButtons
        value={selectedTheme}
        onValueChange={(value) => {
          Appearance.setColorScheme(value === 'system' ? (null as never) : (value as 'light' | 'dark'));
          dispatch(changeTheme(value === 'system' ? null : value));
        }}
        buttons={THEMES_ARRAY[language].map(({ value, title }) => ({ value: value ?? 'system', label: title }))}
        style={styles.segmented}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 18, paddingBottom: 12 },
  segmented: { marginHorizontal: 12 },
});
