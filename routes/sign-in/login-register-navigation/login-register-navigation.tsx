import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { setSignInPageState } from '@R/slices/logining/logining';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { SignInPageStates, signInMap } from '@U/validate-email-password';
import { EMAIL_LINK_NAVIGATION, LOGIN_NAVIGATION, REGISTER_NAVIGATION, RESET_NAVIGATION } from './const';

export default function RegisterNavigation() {
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ language }) => language);
  const { pageState, isDisabledWhenLogining } = useAppSelector(({ logining }) => logining);
  const emailLinkNavigation = EMAIL_LINK_NAVIGATION[language];
  const isEmailLinkPage = pageState === SignInPageStates.emailLink;

  return (
    <View style={styles.layout}>
      <View style={styles.row}>
        <Text variant="bodyMedium" style={{ opacity: isDisabledWhenLogining ? 0.7 : 1 }}>
          {pageState === SignInPageStates.register && LOGIN_NAVIGATION[language].text}
          {pageState === SignInPageStates.login && RESET_NAVIGATION[language].text}
          {pageState === SignInPageStates.reset && REGISTER_NAVIGATION[language].text}
          {isEmailLinkPage && emailLinkNavigation.backText}
        </Text>
        <Button
          mode="text"
          compact
          labelStyle={{ fontFamily: FONT_FAMILIES.semiBold }}
          onPress={() => dispatch(setSignInPageState(isEmailLinkPage ? SignInPageStates.login : signInMap[pageState]))}
          disabled={isDisabledWhenLogining}
          accessibilityRole="button">
          {pageState === SignInPageStates.register && LOGIN_NAVIGATION[language].btn}
          {pageState === SignInPageStates.login && RESET_NAVIGATION[language].btn}
          {pageState === SignInPageStates.reset && REGISTER_NAVIGATION[language].btn}
          {isEmailLinkPage && emailLinkNavigation.backBtn}
        </Button>
      </View>
      {pageState === SignInPageStates.login && (
        <View style={styles.row}>
          <Text variant="bodyMedium" style={{ opacity: isDisabledWhenLogining ? 0.7 : 1 }}>
            {emailLinkNavigation.text}
          </Text>
          <Button
            testID="email-link-navigation"
            mode="text"
            compact
            labelStyle={{ fontFamily: FONT_FAMILIES.semiBold }}
            onPress={() => dispatch(setSignInPageState(SignInPageStates.emailLink))}
            disabled={isDisabledWhenLogining}
            accessibilityRole="button">
            {emailLinkNavigation.btn}
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
});
