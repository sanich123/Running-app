import { StyleSheet } from 'react-native';
import { TextInput, Text } from 'react-native-paper';

import { emailMatcher } from '../../constants/email-password-regexp';

type EmailInputProps = {
  email: string;
  emailError: boolean;
  setEmail: (arg: string) => void;
  setEmailError: (arg: boolean) => void;
};

export default function EmailInput({ email, setEmail, emailError, setEmailError }: EmailInputProps) {
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
