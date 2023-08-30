import { useContext, useState } from 'react';
import { HelperText, TextInput } from 'react-native-paper';

import { passwordMatcher } from '../../constants/regexp';
import { SignInContext } from '../../utils/context/sign-in';

export default function PasswordInput() {
  const { password, setPassword, passwordError, setPasswordError, isDisabled } = useContext(SignInContext);
  const [passwordIsNotVisible, setPasswordIsVisible] = useState(false);
  return (
    <>
      <TextInput
        label="Password"
        value={password}
        onChangeText={(password) => setPassword(password)}
        onEndEditing={() => (!passwordMatcher.test(password) ? setPasswordError(true) : setPasswordError(false))}
        placeholder="Type your password"
        secureTextEntry={passwordIsNotVisible}
        left={<TextInput.Icon icon="form-textbox-password" />}
        right={<TextInput.Icon icon="eye" onPress={() => setPasswordIsVisible(!passwordIsNotVisible)} />}
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
