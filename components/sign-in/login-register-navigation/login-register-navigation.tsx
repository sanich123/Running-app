import { useAppSelector } from '@R/typed-hooks';
import { SignInPageStates, signInMap } from '@U/validate-email-password';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { LOGIN_NAVIGATION, REGISTER_NAVIGATION, RESET_NAVIGATION, RegisterNavigationProps } from './const';

export default function RegisterNavigation({ pageState, setPageState, isDisabled }: RegisterNavigationProps) {
  const { language } = useAppSelector(({ language }) => language);
  const isRegistering = pageState === SignInPageStates.register;
  const isLogining = pageState === SignInPageStates.login;
  const isResetting = pageState === SignInPageStates.reset;

  return (
    <View style={styles.layout}>
      <Text variant="bodyMedium" style={{ opacity: isDisabled ? 0.5 : 1 }}>
        {isRegistering && LOGIN_NAVIGATION[language].text}
        {isLogining && RESET_NAVIGATION[language].text}
        {isResetting && REGISTER_NAVIGATION[language].text}
      </Text>
      <Button
        mode="outlined"
        onPress={() => setPageState(signInMap[pageState])}
        disabled={isDisabled}
        accessibilityRole="button">
        {isRegistering && LOGIN_NAVIGATION[language].btn}
        {isLogining && RESET_NAVIGATION[language].btn}
        {isResetting && REGISTER_NAVIGATION[language].btn}
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
