import { useAppSelector } from '@R/typed-hooks';
import { emailMatcher } from '@const/regexp';
import { HelperText, TextInput } from 'react-native-paper';

import { EmailInputProps, EMAIL_INPUT_TEST_ID, EMAIL_INPUT, EMAIL_INPUT_LEFT_ICON } from './const';

export default function EmailInput({
  email,
  setEmail,
  emailError,
  setEmailError,
  isDisabled,
  passwordRef,
}: EmailInputProps) {
  const { language } = useAppSelector(({ language }) => language);

  return (
    <>
      <TextInput
        testID={EMAIL_INPUT_TEST_ID}
        label={EMAIL_INPUT[language].placeholder}
        value={email}
        onChangeText={(text) => {
          if (!emailMatcher.test(text.trim())) {
            setEmailError(true);
          } else {
            setEmailError(false);
          }
          setEmail(text);
        }}
        onEndEditing={() => {
          if (!emailMatcher.test(email.trim())) {
            setEmailError(true);
          } else {
            setEmailError(false);
          }
        }}
        placeholder={EMAIL_INPUT[language].placeholder}
        onSubmitEditing={() => passwordRef?.current?.focus()}
        left={<TextInput.Icon testID={EMAIL_INPUT_LEFT_ICON} icon="email" disabled={isDisabled} />}
        accessibilityRole="text"
        style={{ marginTop: 15 }}
        mode="outlined"
        keyboardType="email-address"
        autoComplete="email"
        returnKeyType="next"
        disabled={isDisabled}
      />
      {emailError && (
        <HelperText type="error" visible={emailError} padding="none">
          {EMAIL_INPUT[language].helper}
        </HelperText>
      )}
    </>
  );
}
