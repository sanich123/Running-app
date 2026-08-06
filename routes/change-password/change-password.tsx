import { useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { Button, TextInput } from 'react-native-paper';

export default function ChangePassword() {
  const [passwordIsNotVisible, setPasswordIsVisible] = useState(true);

  return (
    <>
      <Stack.Screen options={{ title: 'change-password', headerShown: false }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <TextInput
          mode="outlined"
          label="Новый пароль"
          placeholder={'Введите новый пароль'}
          secureTextEntry={passwordIsNotVisible}
          left={<TextInput.Icon icon="form-textbox-password" />}
          right={<TextInput.Icon icon="eye" onPress={() => setPasswordIsVisible(!passwordIsNotVisible)} />}
        />
        <Button mode="outlined">Поменять пароль</Button>
      </View>
    </>
  );
}
