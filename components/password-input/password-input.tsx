import { useAppSelector } from '@R/typed-hooks';
import { passwordMatcher } from '@const/regexp';
import { useState } from 'react';
import { HelperText, TextInput } from 'react-native-paper';

import {
  PASSWORD_INPUT,
  PASSWORD_INPUT_LEFT_ICON,
  PASSWORD_INPUT_RIGHT_ICON,
  PASSWORD_INPUT_TEST_ID,
  PasswordInputProps,
} from './const';

export default function PasswordInput({
  password,
  setPassword,
  passwordError,
  setPasswordError,
  isDisabled,
  passwordRef,
}: PasswordInputProps) {
  const [passwordIsNotVisible, setPasswordIsVisible] = useState(true);
  const { language } = useAppSelector(({ language }) => language);
  return (
    <>
      <TextInput
        ref={passwordRef}
        testID={PASSWORD_INPUT_TEST_ID}
        label={PASSWORD_INPUT[language].label}
        value={password}
        onChangeText={(password) => {
          if (!passwordMatcher.test(password)) {
            setPasswordError(true);
          } else {
            setPasswordError(false);
          }
          setPassword(password);
        }}
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
        style={{ marginTop: 20 }}
        accessibilityRole="text"
        autoComplete="password"
        mode="outlined"
        disabled={isDisabled}
      />
      {passwordError && (
        <HelperText type="error" visible={passwordError} padding="none">
          {PASSWORD_INPUT[language].helperText}
        </HelperText>
      )}
    </>
  );
}
