import { useContext } from 'react';
import { View, Text, Pressable } from 'react-native';

import { signInStyles } from '../../styles/sign-in-page/sign-in-page';
import { SignInContext } from '../../utils/context/sign-in';

export default function LoginNavigation() {
  const { setIsLogin, setIsRegister, setIsReset } = useContext(SignInContext);
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
        }}>
        <Text style={{ color: 'white' }}>Reset</Text>
      </Pressable>
    </View>
  );
}
