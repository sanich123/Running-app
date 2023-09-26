import { SignInContext } from '@u/context/sign-in';
import { useContext } from 'react';
import { View, Text, Pressable } from 'react-native';

import { signInStyles } from '../../styles/sign-in-page/sign-in-page';

export default function LoginNavigation() {
  const { setIsLogin, setIsRegister, setIsReset, isDisabled } = useContext(SignInContext);
  const { btnWrapper, navigateBtn } = signInStyles;
  return (
    <View style={btnWrapper}>
      <Text>Forgot the password?</Text>
      <Pressable
        style={navigateBtn}
        onPress={() => {
          setIsReset(true);
          setIsLogin(false);
          setIsRegister(false);
        }}
        disabled={isDisabled}>
        <Text style={[{ color: 'white' }, isDisabled && { opacity: 0.5 }]}>Reset</Text>
      </Pressable>
    </View>
  );
}
