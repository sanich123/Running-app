import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';

export default function YearMonthTitle({ year, month }: { year: string; month: string }) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const monthYear = new Date(+year, +month).toLocaleDateString(language === LANGUAGES.russian ? 'ru-RU' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.onSurface }]}>{monthYear}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
  title: {
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 25,
    letterSpacing: -0.4,
    textTransform: 'capitalize',
  },
});
