import { useContext } from 'react';
import { HelperText, TextInput } from 'react-native-paper';

import { emailMatcher } from '../../constants/regexp';
import { SignInContext } from '../../utils/context/sign-in';

export default function EmailInput() {
  const { email, setEmail, emailError, setEmailError, isDisabled } = useContext(SignInContext);
  return (
    <>
      <TextInput
        label="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        onEndEditing={() => (!emailMatcher.test(email) ? setEmailError(true) : setEmailError(false))}
        placeholder="Type your email"
        left={<TextInput.Icon icon="email" />}
        style={{ marginTop: 10 }}
        accessibilityRole="text"
        mode="outlined"
        disabled={isDisabled}
      />
      <HelperText type="error" visible={emailError} padding="none">
        Email must be valid email address
      </HelperText>
    </>
  );
}
