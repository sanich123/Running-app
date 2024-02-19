import { useAppSelector } from '@R/typed-hooks';
import { SignInPageStates, signInMap } from '@U/validate-email-password';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { LOGIN_NAVIGATION, REGISTER_NAVIGATION, RESET_NAVIGATION, RegisterNavigationProps } from './const';

export default function RegisterNavigation({ pageState, setPageState, isDisabled }: RegisterNavigationProps) {
  const { btnWrapper, navigateBtn } = styles;
  const { language } = useAppSelector(({ language }) => language);
  const isRegistering = pageState === SignInPageStates.register;
  const isLogining = pageState === SignInPageStates.login;
  const isResetting = pageState === SignInPageStates.reset;
  return (
    <View style={btnWrapper}>
      <Text>
        {isRegistering && LOGIN_NAVIGATION[language].text}
        {isLogining && RESET_NAVIGATION[language].text}
        {isResetting && REGISTER_NAVIGATION[language].text}
      </Text>
      <Pressable
        style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }, navigateBtn]}
        onPress={() => setPageState(signInMap[pageState])}
        disabled={isDisabled}>
        <Text variant="bodyMedium" style={[{ color: 'white' }, isDisabled && { opacity: 0.5 }]}>
          {isRegistering && LOGIN_NAVIGATION[language].btn}
          {isLogining && RESET_NAVIGATION[language].btn}
          {isResetting && REGISTER_NAVIGATION[language].btn}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  btnWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 10,
    marginTop: 10,
  },
  navigateBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#518be8',
    borderRadius: 8,
    padding: 8,
  },
});
