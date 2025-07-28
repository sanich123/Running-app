import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { SignInPageStates, signInMap } from '@U/validate-email-password';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { LOGIN_NAVIGATION, REGISTER_NAVIGATION, RESET_NAVIGATION } from './const';
import { setSignInPageState } from '@R/slices/logining/logining';

export default function RegisterNavigation() {
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ language }) => language);
  const { pageState, isDisabledWhenLogining } = useAppSelector(({ logining }) => logining);

  return (
    <View style={styles.layout}>
      <Text variant="bodyMedium" style={{ opacity: isDisabledWhenLogining ? 0.7 : 1 }}>
        {pageState === SignInPageStates.register && LOGIN_NAVIGATION[language].text}
        {pageState === SignInPageStates.login && RESET_NAVIGATION[language].text}
        {pageState === SignInPageStates.reset && REGISTER_NAVIGATION[language].text}
      </Text>
      <Button
        mode="outlined"
        onPress={() => dispatch(setSignInPageState(signInMap[pageState]))}
        disabled={isDisabledWhenLogining}
        accessibilityRole="button">
        {pageState === SignInPageStates.register && LOGIN_NAVIGATION[language].btn}
        {pageState === SignInPageStates.login && RESET_NAVIGATION[language].btn}
        {pageState === SignInPageStates.reset && REGISTER_NAVIGATION[language].btn}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    gap: 10,
  },
});
