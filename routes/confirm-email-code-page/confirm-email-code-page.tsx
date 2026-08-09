import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Card, Icon, Text, useTheme } from 'react-native-paper';
import { LANGUAGES, ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import ConfirmEmailCode from './confirm-email-code/confirm-email-code';
import { CONFIRM_EMAIL_PAGE_TEXT } from './const';

export default function ConfirmEmailCodePage() {
  const { colors } = useTheme();
  const { replace } = useRouter();
  const { email } = useAppSelector(({ logining }) => logining);
  const { language } = useAppSelector(({ language }) => language);
  const copy = CONFIRM_EMAIL_PAGE_TEXT[language];

  useEffect(() => {
    if (!email) {
      replace(`/${ROUTES.signIn}`);
    }
  }, [email, replace]);

  if (!email) {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CrossPlatformLayout edges={['top', 'bottom']} scrollViewEnabled>
        <View style={styles.container}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
            <Icon source="email-check-outline" size={38} color={colors.primary} />
          </View>
          <Text variant="headlineSmall" style={styles.title}>
            {copy.title}
          </Text>
          <Text variant="bodyLarge" style={[styles.description, { color: colors.onSurfaceVariant }]}>
            {copy.description(email)}
          </Text>

          <Card mode="contained" style={[styles.emailCard, { backgroundColor: colors.surfaceVariant }]}>
            <Card.Content style={styles.emailCardContent}>
              <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>
                {language === LANGUAGES.russian ? 'Адрес получателя' : 'Recipient email'}
              </Text>
              <Text variant="titleMedium" numberOfLines={2} style={{ color: colors.onSurface }}>
                {email}
              </Text>
            </Card.Content>
          </Card>

          <ConfirmEmailCode email={email} />

          <Text variant="bodyMedium" style={[styles.spamHint, { color: colors.onSurfaceVariant }]}>
            {copy.spam}
          </Text>
        </View>
      </CrossPlatformLayout>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: 420,
    padding: 20,
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 34,
    height: 68,
    justifyContent: 'center',
    marginBottom: 20,
    width: 68,
  },
  title: { fontWeight: '800', textAlign: 'center' },
  description: { marginTop: 12, textAlign: 'center' },
  emailCard: { alignSelf: 'stretch', borderRadius: 16, marginTop: 20 },
  emailCardContent: { gap: 4, paddingVertical: 14 },
  spamHint: { marginTop: 18, textAlign: 'center' },
});
