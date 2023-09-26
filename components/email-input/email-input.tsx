import { emailMatcher } from '@const/regexp';
import { SignInContext } from '@u/context/sign-in';
import { useContext } from 'react';
import { HelperText, TextInput } from 'react-native-paper';

export default function EmailInput() {
  const { email, setEmail, emailError, setEmailError, isDisabled } = useContext(SignInContext);
  return (
    <>
      <TextInput
        label="Email"
        value={email}
        onChangeText={(text) => {
          if (!emailMatcher.test(email)) {
            setEmailError(true);
          } else {
            setEmailError(false);
          }
          setEmail(text);
        }}
        onEndEditing={() => (!emailMatcher.test(email) ? setEmailError(true) : setEmailError(false))}
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
