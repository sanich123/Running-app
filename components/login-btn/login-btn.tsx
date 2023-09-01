import { signInWithEmailAndPassword } from 'firebase/auth';
import { useContext, useEffect } from 'react';
import { Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import { FIREBASE_AUTH } from '../../firebaseConfig';
import { useSignInUserMutation } from '../../redux/runnich-api/runnich-api';
import { getRegisterInfo } from '../../redux/user-info-slice/user-info-slice';
import { SignInContext } from '../../utils/context/sign-in';
import { errorHandler } from '../../utils/error-handler';
import { emailPasswordHandler } from '../../utils/validate-email-password';

export default function LoginBtn() {
  const { email, password, isLoading, isDisabled, setIsDisabled, setIsLoading, setEmailError, setPasswordError } =
    useContext(SignInContext);
  const [signInUser, { data, error }] = useSignInUserMutation();
  const dispatch = useDispatch();
  useEffect(() => {
    if (data) {
      const { email, login, id } = data;
      dispatch(getRegisterInfo({ email, login, id }));
      (async () => {
        try {
          await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
        } catch (e) {
          errorHandler(e);
        }
      })();
      setIsLoading(false);
      setIsLoading(false);
    } else {
      errorHandler(error);
    }
  });
  return (
    <Button
      mode="outlined"
      icon="account"
      onPress={async () => {
        try {
          if (emailPasswordHandler({ email, password, setEmailError, setPasswordError })) {
            setIsLoading(true);
            setIsDisabled(true);
            await signInUser({ email, password }).unwrap();
          }
        } catch (e) {
          errorHandler(e);
          setIsLoading(false);
          setIsLoading(false);
        } finally {
          setIsLoading(false);
          setIsLoading(false);
        }
      }}
      accessibilityRole="button"
      loading={isLoading}
      disabled={isDisabled}>
      {`Login${isLoading ? 'ing' : ''}`}
    </Button>
  );
}
