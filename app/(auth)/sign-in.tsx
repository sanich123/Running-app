import { Stack } from 'expo-router';
import { useState } from 'react';
import { View, StyleSheet, ToastAndroid } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

import { logInWithEmailAndPassword, registerWithEmailAndPassword } from '../../auth/firebase/email-auth';

export default function SignIn() {
  const emailMatcher = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  const passwordMatcher = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,8}$/g;
  const [email, setEmail] = useState('someemail@gmail.com');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [password, setPassword] = useState('7FWD7rlm');
  const [passwordIsNotVisible, setPasswordIsVisible] = useState(true);

  function emailPasswordHandler(email: string, password: string) {
    if (!emailMatcher.test(email)) {
      ToastAndroid.show('Your email does not match the required pattern', ToastAndroid.SHORT);
      setEmailError(true);
      setTimeout(() => setEmailError(false), 2000);
    }
    if (!passwordMatcher.test(password)) {
      ToastAndroid.show('Your password should match the pattern', ToastAndroid.SHORT);
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'sign up', headerShown: false }} />
      <View style={styles.container}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          placeholder="Type your email"
          left={<TextInput.Icon icon="email" />}
          style={{ marginTop: 15 }}
        />
        {emailError && (
          <Text
            variant="titleSmall"
            style={{ color: 'red' }}>{`Your email doesn't match the required pattern: ${emailMatcher}`}</Text>
        )}
        <TextInput
          label="Password"
          value={password}
          onChangeText={(password) => setPassword(password)}
          placeholder="Type your password"
          secureTextEntry={passwordIsNotVisible}
          left={<TextInput.Icon icon="form-textbox-password" />}
          right={<TextInput.Icon icon="eye" onPress={() => setPasswordIsVisible(!passwordIsNotVisible)} />}
          style={{ marginTop: 15 }}
        />
        {passwordError && (
          <Text
            variant="titleSmall"
            style={{ color: 'red' }}>{`Your password doesn't match the required pattern: ${passwordMatcher}`}</Text>
        )}
        <Button
          icon="login"
          mode="outlined"
          style={{ marginTop: 15 }}
          onPress={() => {
            emailPasswordHandler(email, password);
            registerWithEmailAndPassword(email, password);
          }}>
          Register
        </Button>
        <Button
          mode="outlined"
          style={{ marginTop: 15 }}
          onPress={async () => await logInWithEmailAndPassword(email, password)}>
          Login
        </Button>
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
