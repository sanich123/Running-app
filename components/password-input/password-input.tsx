import { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, Text } from 'react-native-paper';

import { passwordMatcher } from '../../constants/email-password-regexp';
import { SignInContext } from '../../utils/context/sign-in';

export default function PasswordInput() {
  const { password, setPassword, passwordError, setPasswordError } = useContext(SignInContext);
  const [passwordIsNotVisible, setPasswordIsVisible] = useState(false);
  return (
    <>
      {passwordError && (
        <Text
          variant="titleSmall"
          style={styles.error}>{`Your password doesn't match the required pattern: \n${passwordMatcher}`}</Text>
      )}
      <TextInput
        label="Password"
        value={password}
        onChangeText={(password) => setPassword(password)}
        onEndEditing={() => (!passwordMatcher.test(password) ? setPasswordError(true) : setPasswordError(false))}
        placeholder="Type your password"
        secureTextEntry={passwordIsNotVisible}
        left={<TextInput.Icon icon="form-textbox-password" />}
        right={<TextInput.Icon icon="eye" onPress={() => setPasswordIsVisible(!passwordIsNotVisible)} />}
        style={{ marginTop: 15 }}
        accessibilityRole="text"
      />
    </>
  );
}

const styles = StyleSheet.create({
  error: {
    color: 'red',
    display: 'flex',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: -15,
  },
});
