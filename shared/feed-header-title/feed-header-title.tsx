import type { PropsWithChildren } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';

export default function FeedHeaderTitle({ children }: PropsWithChildren) {
  const { colors, dark } = useTheme();
  const { replace } = useRouter();
  const title = <Text style={[styles.title, { color: colors.primary }]}>{children}</Text>;

  if (Platform.OS !== 'web') {
    return title;
  }

  return (
    <TouchableRipple
      accessibilityRole="link"
      borderless
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      onPress={() => replace(ROUTES.root)}
      style={styles.link}>
      {title}
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  link: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  title: {
    fontFamily: FONT_FAMILIES.semiBold,
    fontSize: 16,
  },
});
