import { passwordMatcher } from '@const/regexp';
import { useState } from 'react';
import { HelperText, TextInput } from 'react-native-paper';
import { useSelector } from 'react-redux';

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
}: PasswordInputProps) {
  const [passwordIsNotVisible, setPasswordIsVisible] = useState(false);
  const { language } = useSelector(({ language }) => language);
  return (
    <>
      <TextInput
        testID={PASSWORD_INPUT_TEST_ID}
        label={PASSWORD_INPUT[language as keyof typeof PASSWORD_INPUT].label}
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
        placeholder={PASSWORD_INPUT[language as keyof typeof PASSWORD_INPUT].placeholder}
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
        style={{ marginTop: 10 }}
        accessibilityRole="text"
        mode="outlined"
        disabled={isDisabled}
      />
      <HelperText type="error" visible={passwordError} padding="none">
        {PASSWORD_INPUT[language as keyof typeof PASSWORD_INPUT].helperText}
      </HelperText>
    </>
  );
}
