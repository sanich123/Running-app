import { useContext } from 'react';
import { View, Text, Pressable } from 'react-native';

import { signInStyles } from '../../styles/sign-in-page/sign-in-page';
import { SignInContext } from '../../utils/context/sign-in';

export default function RegisterNavigation() {
  const { setIsLogin, setIsRegister, isDisabled } = useContext(SignInContext);
  const { btnWrapper, navigateBtn } = signInStyles;
  return (
    <View style={btnWrapper}>
      <Text>Already have an account?</Text>
      <Pressable
        style={navigateBtn}
        onPress={() => {
          setIsLogin(true);
          setIsRegister(false);
        }}
        disabled={isDisabled}>
        <Text style={{ color: 'white' }}>Login</Text>
      </Pressable>
    </View>
  );
}
