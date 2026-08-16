import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useRouter } from 'expo-router';

export default function LegalLinks() {
  const { colors } = useTheme();
  const { push } = useRouter();
  return (
    <View style={styles.layout}>
      <Text variant="bodySmall" style={styles.caption}>
        Продолжая, вы соглашаетесь с
      </Text>
      <View style={styles.links}>
        <Pressable onPress={() => push(`/${ROUTES.legalInformation}`)} accessibilityRole="link">
          <Text variant="bodySmall" style={[styles.link, { color: colors.primary }]}>Условиями пользования</Text>
        </Pressable>
        <Text variant="bodySmall" style={styles.caption}>и</Text>
        <Pressable onPress={() => push(`/${ROUTES.privacyPolicy}`)} accessibilityRole="link">
          <Text variant="bodySmall" style={[styles.link, { color: colors.primary }]}>Политикой конфиденциальности</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: { alignItems: 'center', gap: 0, marginTop: 10 },
  links: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 2, justifyContent: 'center' },
  caption: { opacity: 0.65, textAlign: 'center' },
  link: { textAlign: 'center' },
});
