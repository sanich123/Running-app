import { Stack } from 'expo-router';
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordIsNotVisible, setPasswordIsVisible] = useState(true);

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
        <Button
          icon="login"
          mode="outlined"
          style={{ marginTop: 15 }}
          onPress={() => alert(JSON.stringify({ email, password }))}>
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
