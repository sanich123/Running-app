import { useContext } from 'react';
import { View, Text, Pressable } from 'react-native';

import { signInStyles } from '../../styles/sign-in-page/sign-in-page';
import { SignInContext } from '../../utils/context/sign-in';

export default function ResetNavigation() {
  const { setIsLogin, setIsRegister, setIsReset, isDisabled } = useContext(SignInContext);
  const { btnWrapper, navigateBtn } = signInStyles;
  return (
    <View style={btnWrapper}>
      <Text>Don't have an account?</Text>
      <Pressable
        style={navigateBtn}
        onPress={() => {
          setIsRegister(true);
          setIsLogin(false);
          setIsReset(false);
        }}
        disabled={isDisabled}>
        <Text style={[{ color: 'white' }, isDisabled && { opacity: 0.5 }]}>Register</Text>
      </Pressable>
    </View>
  );
}
