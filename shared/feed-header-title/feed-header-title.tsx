import type { PropsWithChildren } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { FEED_HEADER_BRAND } from './const';

export default function FeedHeaderTitle({ children, isBrand = false }: PropsWithChildren<{ isBrand?: boolean }>) {
  const { colors } = useTheme();
  const { canGoBack, replace } = useRouter();
  const hasBackRoute = canGoBack();

  if (isBrand && hasBackRoute) {
    return null;
  }

  if (Platform.OS !== 'web') {
    return (
      <Text
        accessibilityLabel={isBrand ? FEED_HEADER_BRAND.accessibilityLabel : undefined}
        style={[isBrand ? styles.brand : styles.title, { color: colors.primary }]}>
        {isBrand ? FEED_HEADER_BRAND.title : children}
      </Text>
    );
  }

  if (!isBrand && hasBackRoute) {
    return <Text style={[styles.title, { color: colors.primary }]}>{children}</Text>;
  }

  return (
    <TouchableRipple accessibilityRole="link" borderless onPress={() => replace(ROUTES.root)} style={styles.link}>
      <Text accessibilityLabel={FEED_HEADER_BRAND.accessibilityLabel} style={[styles.brand, { color: colors.primary }]}>
        {FEED_HEADER_BRAND.title}
      </Text>
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
  brand: {
    fontFamily: FONT_FAMILIES.extraBold,
    fontSize: 18,
    letterSpacing: 1.4,
  },
});
