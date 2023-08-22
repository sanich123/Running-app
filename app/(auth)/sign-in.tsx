import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';

import EmailInput from '../../components/email-input/email-input';
import LoginBtn from '../../components/login-btn/login-btn';
import PasswordInput from '../../components/password-input/password-input';
import RegisterBtn from '../../components/register-btn/register-btn';
import usePasswordEmail from '../../utils/hooks/use-password-email';

export default function SignIn() {
  const { email, password, emailError, passwordError, setEmail, setEmailError, setPasswordError, setPassword } =
    usePasswordEmail();

  return (
    <>
      <Stack.Screen options={{ title: 'sign up', headerShown: false }} />
      <View style={styles.container}>
        <EmailInput email={email} setEmail={setEmail} emailError={emailError} setEmailError={setEmailError} />
        <PasswordInput
          password={password}
          setPassword={setPassword}
          passwordError={passwordError}
          setPasswordError={setPasswordError}
        />
        <RegisterBtn
          email={email}
          password={password}
          setEmailError={setEmailError}
          setPasswordError={setPasswordError}
        />
        <LoginBtn email={email} password={password} setEmailError={setEmailError} setPasswordError={setPasswordError} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});
