import { useState } from 'react';
import { HelperText, TextInput } from 'react-native-paper';

import { passwordMatcher } from '../../constants/regexp';

type PasswordInputProps = {
  password: string;
  setPassword: (arg: string) => void;
  passwordError: boolean;
  setPasswordError: (arg: boolean) => void;
  isDisabled: boolean;
};

export default function PasswordInput({
  password,
  setPassword,
  passwordError,
  setPasswordError,
  isDisabled,
}: PasswordInputProps) {
  const [passwordIsNotVisible, setPasswordIsVisible] = useState(false);
  return (
    <>
      <TextInput
        label="Password"
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
        placeholder="Type your password"
        secureTextEntry={passwordIsNotVisible}
        left={<TextInput.Icon icon="form-textbox-password" disabled={isDisabled} />}
        right={
          <TextInput.Icon
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
        Password must contain one capital, one normal letter, one number, length 4-8 symbols
      </HelperText>
    </>
  );
}
