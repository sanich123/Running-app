import { emailMatcher } from '@const/regexp';
import { SignInContext } from '@u/context/sign-in';
import { errorHandler } from '@u/error-handler';
import { useContext } from 'react';
import { Button } from 'react-native-paper';

export default function ResetBtn() {
  const { email, isLoading, setIsLoading, setEmailError, isDisabled, setIsDisabled } = useContext(SignInContext);

  return (
    <Button
      icon="refresh"
      mode="outlined"
      loading={isLoading}
      onPress={async () => {
        try {
          if (emailMatcher.test(email)) {
            setIsLoading(true);
            setIsDisabled(true);
            setIsLoading(false);
            setIsDisabled(false);
          } else {
            setEmailError(true);
          }
        } catch (e) {
          errorHandler(e);
          setIsLoading(false);
          setIsDisabled(false);
        } finally {
          setIsLoading(false);
          setIsLoading(false);
          setIsDisabled(false);
        }
      }}
      disabled={isDisabled}>
      {`Reset${isLoading ? 'ing' : ''}`}
    </Button>
  );
}
