import { HelperText, TextInput } from 'react-native-paper';

import { emailMatcher } from '../../constants/regexp';

type EmailInputProps = {
  email: string;
  setEmail: (arg: string) => void;
  emailError: boolean;
  setEmailError: (arg: boolean) => void;
  isDisabled: boolean;
};

export default function EmailInput({ email, setEmail, emailError, setEmailError, isDisabled }: EmailInputProps) {
  return (
    <>
      <TextInput
        testID="inputEmail"
        label="Email"
        value={email}
        onChangeText={(text) => {
          if (!emailMatcher.test(email.trim())) {
            setEmailError(true);
          } else {
            setEmailError(false);
          }
          setEmail(text);
        }}
        onEndEditing={() => (!emailMatcher.test(email.trim()) ? setEmailError(true) : setEmailError(false))}
        placeholder="Type your email"
        left={<TextInput.Icon icon="email" disabled={isDisabled} />}
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
