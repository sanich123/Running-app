import { useContext, useState } from 'react';
import { TextInput } from 'react-native-paper';

import { passwordMatcher } from '../../constants/regexp';
import { SignInContext } from '../../utils/context/sign-in';

export default function PasswordInput() {
  const { password, setPassword, passwordError, setPasswordError } = useContext(SignInContext);
  const [passwordIsNotVisible, setPasswordIsVisible] = useState(false);
  return (
    <TextInput
      label={passwordError ? '1 capital, 1 normal letter, 4-8 symbols' : 'Password'}
      value={password}
      onChangeText={(password) => setPassword(password)}
      onEndEditing={() => (!passwordMatcher.test(password) ? setPasswordError(true) : setPasswordError(false))}
      placeholder="Type your password"
      secureTextEntry={passwordIsNotVisible}
      left={<TextInput.Icon icon="form-textbox-password" />}
      right={<TextInput.Icon icon="eye" onPress={() => setPasswordIsVisible(!passwordIsNotVisible)} />}
      style={{ marginTop: 15 }}
      accessibilityRole="text"
      mode="outlined"
    />
  );
}
