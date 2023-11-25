import { View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { LOGIN_NAVIGATION, REGISTER_NAVIGATION, RegisterNavigationProps } from './const';
import { signInStyles } from '../../app/(auth)/sign-in';

export default function RegisterNavigation({ isRegister, setIsRegister, isDisabled }: RegisterNavigationProps) {
  const { btnWrapper, navigateBtn } = signInStyles;
  const { language } = useSelector(({ language }) => language);
  return (
    <View style={btnWrapper}>
      <Text>
        {isRegister
          ? REGISTER_NAVIGATION[language as keyof typeof REGISTER_NAVIGATION].text
          : LOGIN_NAVIGATION[language as keyof typeof LOGIN_NAVIGATION].text}
      </Text>
      <Pressable style={navigateBtn} onPress={() => setIsRegister(!isRegister)} disabled={isDisabled}>
        <Text variant="bodyMedium" style={[{ color: 'white' }, isDisabled && { opacity: 0.5 }]}>
          {isRegister
            ? REGISTER_NAVIGATION[language as keyof typeof REGISTER_NAVIGATION].btn
            : LOGIN_NAVIGATION[language as keyof typeof LOGIN_NAVIGATION].btn}
        </Text>
      </Pressable>
    </View>
  );
}
