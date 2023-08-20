import { useState } from 'react';
import { Button, TextInput } from 'react-native-paper';

import { View } from '../components/Themed';
import { signInWithSocialNetwork } from '../firebase/social-auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordIsNotVisible, setPasswordIsVisible] = useState(true);
  return (
    <View>
      <TextInput
        label="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        placeholder="Type your email"
        style={{ marginTop: 15 }}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={(password) => setPassword(password)}
        placeholder="Type your password"
        secureTextEntry={passwordIsNotVisible}
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
      <Button icon="google" mode="outlined" style={{ marginTop: 15 }} onPress={signInWithSocialNetwork}>
        Login with Google
      </Button>
    </View>
  );
}
