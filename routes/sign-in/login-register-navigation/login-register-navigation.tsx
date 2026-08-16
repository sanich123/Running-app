import { View, StyleSheet } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import { SignInPageStates, signInMap } from '@U/validate-email-password';
import { EMAIL_LINK_NAVIGATION, LOGIN_NAVIGATION, REGISTER_NAVIGATION, RESET_NAVIGATION } from './const';
import { REGISTERED_USERS_ONLY_LABEL } from '../const';

export default function RegisterNavigation({
  authStep = SignInPageStates.login,
  onAuthStepChange = () => undefined,
  showEmailLinkNavigation = true,
}: {
  authStep?: SignInPageStates;
  onAuthStepChange?: (step: SignInPageStates) => void;
  showEmailLinkNavigation?: boolean;
}) {
  const { language } = useAppSelector(({ language }) => language);
  const { isDisabledWhenLogining } = useAppSelector(({ logining }) => logining);
  const { colors } = useTheme();
  const emailLinkNavigation = EMAIL_LINK_NAVIGATION[language];
  const isEmailLinkPage = authStep === SignInPageStates.emailLink;

  return (
    <View style={styles.layout}>
      {showEmailLinkNavigation && authStep === SignInPageStates.login && (
        <View style={styles.emailLinkRow}>
          <Text style={styles.registeredUsersLabel}>{REGISTERED_USERS_ONLY_LABEL[language]}</Text>
          <Button
            testID="email-link-navigation"
            mode="contained-tonal"
            contentStyle={{ minHeight: 48 }}
            icon="email-outline"
            buttonColor={colors.secondaryContainer}
            textColor={colors.onSecondaryContainer}
            labelStyle={{ fontFamily: FONT_FAMILIES.semiBold }}
            style={styles.emailLinkButton}
            onPress={() => onAuthStepChange(SignInPageStates.emailLink)}
            disabled={isDisabledWhenLogining}
            accessibilityRole="button">
            {emailLinkNavigation.btn}
          </Button>
        </View>
      )}
      <View style={styles.row}>
        <Text variant="bodyMedium" style={{ opacity: isDisabledWhenLogining ? 0.7 : 1 }}>
          {authStep === SignInPageStates.login && REGISTER_NAVIGATION[language].text}
          {authStep === SignInPageStates.register && RESET_NAVIGATION[language].text}
          {authStep === SignInPageStates.reset && LOGIN_NAVIGATION[language].text}
          {isEmailLinkPage && emailLinkNavigation.backText}
        </Text>
        <Button
          mode="text"
          compact
          labelStyle={{ fontFamily: FONT_FAMILIES.semiBold }}
          onPress={() => onAuthStepChange(isEmailLinkPage ? SignInPageStates.login : signInMap[authStep])}
          disabled={isDisabledWhenLogining}
          accessibilityRole="button">
          {authStep === SignInPageStates.login && REGISTER_NAVIGATION[language].btn}
          {authStep === SignInPageStates.register && RESET_NAVIGATION[language].btn}
          {authStep === SignInPageStates.reset && LOGIN_NAVIGATION[language].btn}
          {isEmailLinkPage && emailLinkNavigation.backBtn}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 0,
  },
  emailLinkRow: {
    alignItems: 'stretch',
    width: '100%',
  },
  registeredUsersLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  emailLinkButton: {
    borderRadius: 8,
    marginTop: 8,
  },
});
