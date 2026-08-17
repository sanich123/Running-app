import { StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import { INTRO } from './const';

export default function Intro() {
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
        <IconButton icon="run-fast" iconColor={colors.primary} size={42} style={styles.icon} />
      </View>
      <Text variant="headlineMedium" style={styles.title}>
        {INTRO[language].welcome}
      </Text>
      <Text variant="bodyLarge" style={[styles.description, { color: colors.onSurfaceVariant }]}>
        {INTRO[language].features}
      </Text>
      <Text variant="titleMedium" style={[styles.slogan, { color: colors.primary }]}>
        {INTRO[language].coolSlogan}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    height: 72,
    borderRadius: 20,
    marginBottom: 24,
  },
  icon: { margin: 0 },
  title: {
    fontFamily: FONT_FAMILIES.extraBold,
    textAlign: 'center',
  },
  description: {
    fontFamily: FONT_FAMILIES.regular,
    lineHeight: 24,
    marginTop: 12,
    maxWidth: 420,
    textAlign: 'center',
  },
  slogan: {
    fontFamily: FONT_FAMILIES.semiBold,
    marginTop: 16,
    textAlign: 'center',
  },
});
