import { useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { Button, TextInput } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { CHANGE_PASSWORD_TEST_ID, CHANGE_PASSWORD_TEXT } from './const';

export default function ChangePassword() {
  const [passwordIsNotVisible, setPasswordIsVisible] = useState(true);

  return (
    <>
      <Stack.Screen options={{ title: ROUTES.changePassword, headerShown: false }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <TextInput
          testID={CHANGE_PASSWORD_TEST_ID.input}
          mode="outlined"
          label={CHANGE_PASSWORD_TEXT.label}
          placeholder={CHANGE_PASSWORD_TEXT.placeholder}
          secureTextEntry={passwordIsNotVisible}
          left={<TextInput.Icon icon="form-textbox-password" />}
          right={
            <TextInput.Icon
              testID={CHANGE_PASSWORD_TEST_ID.visibility}
              icon="eye"
              onPress={() => setPasswordIsVisible(!passwordIsNotVisible)}
            />
          }
        />
        <Button testID={CHANGE_PASSWORD_TEST_ID.submit} mode="outlined">
          {CHANGE_PASSWORD_TEXT.submit}
        </Button>
      </View>
    </>
  );
}
