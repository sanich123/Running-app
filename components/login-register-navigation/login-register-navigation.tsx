import { View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { LOGIN_NAVIGATION, REGISTER_NAVIGATION, RegisterNavigationProps } from './const';
import { signInStyles } from '../../styles/sign-in-page/sign-in-page';

export default function RegisterNavigation({ isRegister, setIsRegister, isDisabled }: RegisterNavigationProps) {
  const { btnWrapper, navigateBtn } = signInStyles;
  const { language } = useSelector(({ language }) => language);
  return (
    <View style={btnWrapper}>
      <Text>{isRegister ? REGISTER_NAVIGATION[language].text : LOGIN_NAVIGATION[language].text}</Text>
      <Pressable style={navigateBtn} onPress={() => setIsRegister(!isRegister)} disabled={isDisabled}>
        <Text variant="bodyMedium" style={[{ color: 'white' }, isDisabled && { opacity: 0.5 }]}>
          {isRegister ? REGISTER_NAVIGATION[language].btn : LOGIN_NAVIGATION[language].btn}
        </Text>
      </Pressable>
    </View>
  );
}