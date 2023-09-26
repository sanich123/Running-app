import { passwordMatcher } from '@const/regexp';
import { SignInContext } from '@u/context/sign-in';
import { useContext, useState } from 'react';
import { HelperText, TextInput } from 'react-native-paper';

export default function PasswordInput() {
  const { password, setPassword, passwordError, setPasswordError, isDisabled } = useContext(SignInContext);
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
