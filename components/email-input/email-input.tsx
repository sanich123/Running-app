import { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, Text } from 'react-native-paper';

import { emailMatcher } from '../../constants/email-password-regexp';
import { SignInContext } from '../../utils/context/sign-in';

export default function EmailInput() {
  const { email, setEmail, emailError, setEmailError } = useContext(SignInContext);
  return (
    <>
      {emailError && (
        <Text
          variant="titleSmall"
          style={styles.error}>{`Your email doesn't match the required pattern: ${emailMatcher}`}</Text>
      )}
      <TextInput
        label="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        onEndEditing={() => (!emailMatcher.test(email) ? setEmailError(true) : setEmailError(false))}
        placeholder="Type your email"
        left={<TextInput.Icon icon="email" />}
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
