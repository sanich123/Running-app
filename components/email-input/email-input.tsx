import { useContext } from 'react';
import { TextInput } from 'react-native-paper';

import { emailMatcher } from '../../constants/email-password-regexp';
import { SignInContext } from '../../utils/context/sign-in';

export default function EmailInput() {
  const { email, setEmail, emailError, setEmailError } = useContext(SignInContext);
  return (
    <TextInput
      label={emailError ? 'Must be valid email address' : 'Email'}
      value={email}
      onChangeText={(text) => setEmail(text)}
      onEndEditing={() => (!emailMatcher.test(email) ? setEmailError(true) : setEmailError(false))}
      placeholder="Type your email"
      left={<TextInput.Icon icon="email" />}
      style={{ marginTop: 15 }}
      accessibilityRole="text"
      mode="outlined"
    />
  );
}
