import { supabase } from '@A/supabase/supabase-init';
import { PASSWORD_INPUT, PASSWORD_INPUT_LEFT_ICON, PASSWORD_INPUT_RIGHT_ICON } from '@C/password-input/const';
import { useAppSelector } from '@R/typed-hooks';
import { errorHandler } from '@U/error-handler';
import { passwordMatcher } from '@const/regexp';
import * as Device from 'expo-device';
import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
//@ts-ignore
import { useToast } from 'react-native-toast-notifications';

export default function ChangePasswordPage() {
  const toast = useToast();
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
          placeholder={PASSWORD_INPUT[language].placeholder}
          secureTextEntry={passwordIsNotVisible}
          left={<TextInput.Icon icon="form-textbox-password" testID={PASSWORD_INPUT_LEFT_ICON} disabled={isDisabled} />}
          right={
            <TextInput.Icon
              testID={PASSWORD_INPUT_RIGHT_ICON}
              icon="eye"
              onPress={() => setPasswordIsVisible(!passwordIsNotVisible)}
              disabled={isDisabled}
            />
          }
          disabled={isDisabled}
        />
        <HelperText type="error" visible={passwordError} padding="none">
          {passwordError ? PASSWORD_INPUT[language].helperText : null}
        </HelperText>
        <Button
          mode="outlined"
          style={{ opacity: isDisabled ? 0.5 : 1 }}
          onPress={async () => {
            try {
              if (!passwordError && password) {
                setIsDisabled(true);
                const { data, error } = await supabase.auth.updateUser({ password });
                if (data.user) {
                  toast.show('Успешно, перенаправляем дальше в приложение');
                  if (Device.deviceType === Device.DeviceType.DESKTOP) {
                    push('/');
                    return;
                  } else {
                    const redirectUrl = Linking.createURL('com.supabase://sign-in');
                    Linking.openURL(redirectUrl);
                  }
                }
                if (error) {
                  toast.show(error.message);
                }
              } else {
                setPasswordError(true);
              }
            } catch (error) {
              errorHandler(error);
            } finally {
              setIsDisabled(false);
            }
          }}
          disabled={isDisabled}>
          Поменять пароль
        </Button>
      </View>
    </>
  );
}
