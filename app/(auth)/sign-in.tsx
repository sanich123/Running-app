import { Stack } from 'expo-router';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';

import EmailInput from '../../components/email-input/email-input';
import LoginBtn from '../../components/login-btn/login-btn';
import NicknameInput from '../../components/nickname-input/nickname-input';
import PasswordInput from '../../components/password-input/password-input';
import RegisterBtn from '../../components/register-btn/register-btn';
import ResetBtn from '../../components/reset-btn/reset-btn';
import usePasswordEmail from '../../utils/hooks/use-password-email';

export default function SignIn() {
  const {
    email,
    emailError,
    passwordError,
    password,
    nickname,
    nicknameError,
    isRegister,
    isReset,
    isLogin,
    setEmail,
    setEmailError,
    setPasswordError,
    setPassword,
    setNickname,
    setNicknameError,
    setIsRegister,
    setIsReset,
    setIsLogin,
  } = usePasswordEmail();

  return (
    <>
      <Stack.Screen options={{ title: 'sign up', headerShown: false }} />
      <View style={styles.container}>
        {isRegister && (
          <NicknameInput
            nickname={nickname}
            nicknameError={nicknameError}
            setNickname={setNickname}
            setNicknameError={setNicknameError}
          />
        )}
        <EmailInput email={email} setEmail={setEmail} emailError={emailError} setEmailError={setEmailError} />
        {!isReset && (
          <PasswordInput
            password={password}
            setPassword={setPassword}
            passwordError={passwordError}
            setPasswordError={setPasswordError}
          />
        )}

        {isRegister && (
          <RegisterBtn
            email={email}
            password={password}
            setEmailError={setEmailError}
            setPasswordError={setPasswordError}
            nickname={nickname}
          />
        )}
        {isLogin && (
          <LoginBtn
            email={email}
            password={password}
            setEmailError={setEmailError}
            setPasswordError={setPasswordError}
          />
        )}

        {isReset && <ResetBtn email={email} setEmailError={setEmailError} />}
        {isRegister && (
          <View style={styles.btnWrapper}>
            <Text>Already have an account?</Text>
            <Pressable
              style={styles.navigateBtn}
              onPress={() => {
                setIsLogin(true);
                setIsRegister(false);
              }}>
              <Text style={{ color: 'white' }}>Login</Text>
            </Pressable>
          </View>
        )}
        {isLogin && (
          <View style={styles.btnWrapper}>
            <Text>Forgot the password?</Text>
            <Pressable
              style={styles.navigateBtn}
              onPress={() => {
                setIsReset(true);
                setIsLogin(false);
                setIsRegister(false);
              }}>
              <Text style={{ color: 'white' }}>Reset</Text>
            </Pressable>
          </View>
        )}
        {(isReset || isLogin) && (
          <View style={styles.btnWrapper}>
            <Text>Don't have an account?</Text>
            <Pressable
              style={styles.navigateBtn}
              onPress={() => {
                setIsRegister(true);
                setIsLogin(false);
                setIsReset(false);
              }}>
              <Text style={{ color: 'white' }}>Register</Text>
            </Pressable>
          </View>
        )}
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
  btnWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 15,
    marginTop: 15,
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
