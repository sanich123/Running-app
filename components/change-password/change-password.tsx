import { supabase } from '@A/supabase/supabase-init';
import { useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { errorHandler } from '@U/error-handler';
import { passwordMatcher } from '@const/regexp';
import * as Device from 'expo-device';
import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';

export default function ChangePassword() {
  const [password, setPassword] = useState('');
  const [passwordIsNotVisible, setPasswordIsVisible] = useState(true);
  const [passwordError, setPasswordError] = useState(false);
  const { language } = useAppSelector(({ language }) => language);
  const [isDisabled, setIsDisabled] = useState(false);
  const { push } = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'change-password', headerShown: false }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <TextInput
          mode="outlined"
          label="Новый пароль"
          onChangeText={(password) => {
            if (!passwordMatcher.test(password)) {
              setPasswordError(true);
            } else {
              setPasswordError(false);
            }
            setPassword(password);
          }}
          style={{ opacity: isDisabled ? 0.5 : 1 }}
          value={password}
          onEndEditing={() => (!passwordMatcher.test(password) ? setPasswordError(true) : setPasswordError(false))}
          placeholder={'Введите новый пароль'}
          secureTextEntry={passwordIsNotVisible}
          left={<TextInput.Icon icon="form-textbox-password" disabled={isDisabled} />}
          right={
            <TextInput.Icon
              icon="eye"
              onPress={() => setPasswordIsVisible(!passwordIsNotVisible)}
              disabled={isDisabled}
            />
          }
          disabled={isDisabled}
        />
        <Button mode="outlined" style={{ opacity: isDisabled ? 0.5 : 1 }} disabled={isDisabled}>
          Поменять пароль
        </Button>
      </View>
    </>
  );
}
