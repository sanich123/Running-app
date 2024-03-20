import { useAppSelector } from '@R/typed-hooks';
import { SignInPageStates, signInMap } from '@U/validate-email-password';
import { View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';

import { LOGIN_NAVIGATION, REGISTER_NAVIGATION, RESET_NAVIGATION, RegisterNavigationProps } from './const';

export default function RegisterNavigation({ pageState, setPageState, isDisabled }: RegisterNavigationProps) {
  const { language } = useAppSelector(({ language }) => language);
  const isRegistering = pageState === SignInPageStates.register;
  const isLogining = pageState === SignInPageStates.login;
  const isResetting = pageState === SignInPageStates.reset;

  return (
    <View className="flex-row justify-center items-center gap-x-2 my-3">
      <Text variant="bodyMedium" style={{ opacity: isDisabled ? 0.5 : 1 }}>
        {isRegistering && LOGIN_NAVIGATION[language].text}
        {isLogining && RESET_NAVIGATION[language].text}
        {isResetting && REGISTER_NAVIGATION[language].text}
      </Text>

      <Pressable
        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        onPress={() => setPageState(signInMap[pageState])}
        disabled={isDisabled}>
        <View className="flex rounded-xl py-1.5 px-3 bg-cyan-600">
          <Text variant="bodyMedium" style={{ opacity: isDisabled ? 0.5 : 1 }}>
            {isRegistering && LOGIN_NAVIGATION[language].btn}
            {isLogining && RESET_NAVIGATION[language].btn}
            {isResetting && REGISTER_NAVIGATION[language].btn}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
