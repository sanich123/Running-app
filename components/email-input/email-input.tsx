import { useAppSelector } from '@R/typed-hooks';
import { emailMatcher } from '@const/regexp';
import { TextInput } from 'react-native-paper';

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
        label={emailError && email ? EMAIL_INPUT[language].helper : EMAIL_INPUT[language].placeholder}
        value={email}
        onChangeText={(text) => {
          if (!emailMatcher.test(text.trim())) {
            setEmailError(true);
          } else {
            setEmailError(false);
          }
          setEmail(text);
        }}
        onEndEditing={() => (!emailMatcher.test(email.trim()) ? setEmailError(true) : setEmailError(false))}
        placeholder={EMAIL_INPUT[language].placeholder}
        onSubmitEditing={() => passwordRef?.current?.focus()}
        left={
          <TextInput.Icon
            testID={EMAIL_INPUT_LEFT_ICON}
            icon="email"
            disabled={isDisabled}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        }
        error={emailError}
        accessibilityRole="text"
        style={{ marginTop: 15, width: '100%', minWidth: 366 }}
        mode="outlined"
        inputMode="email"
        autoComplete="email"
        enterKeyHint="next"
        disabled={isDisabled}
      />
    </>
  );
}
