// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { addDoc, collection } from 'firebase/firestore';
import { useContext, useEffect } from 'react';
import { ToastAndroid } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';

import { supabase } from '../../auth/supabase/supabase-init';
import { nicknameMatcher } from '../../constants/regexp';
// import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';
import { useSignUpUserMutation } from '../../redux/runnich-api/runnich-api';
import { getRegisterInfo } from '../../redux/user-info-slice/user-info-slice';
import { SignInContext } from '../../utils/context/sign-in';
import { errorHandler } from '../../utils/error-handler';
import { emailPasswordHandler } from '../../utils/validate-email-password';

export default function RegisterBtn() {
  const {
    email,
    password,
    nickname,
    isLoading,
    setNicknameError,
    setEmailError,
    setPasswordError,
    setIsLoading,
    setIsDisabled,
    isDisabled,
  } = useContext(SignInContext);
  const [signUpUser, { error, data }] = useSignUpUserMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (data) {
      const { id, login, email } = data;
      dispatch(getRegisterInfo({ id, login, email }));
      (async () => {
        try {
          const {
            error,
            data: { user },
          } = await supabase.auth.signUp({ email, password });
          console.log(user?.id, error);
        } catch (err) {
          errorHandler(err);
        }
      })();
      setIsLoading(false);
      setIsDisabled(false);
    }
    if (error) {
      console.log(error);
      ToastAndroid.show('Something wrong with your registration, try again', ToastAndroid.SHORT);
    }
  }, [error, data]);

  return (
    <Button
      rippleColor="#FF000020"
      icon="login"
      mode="outlined"
      loading={isLoading}
      onPress={async () => {
        try {
          if (!nicknameMatcher.test(nickname)) {
            setNicknameError(true);
          } else if (emailPasswordHandler({ email, password, setEmailError, setPasswordError })) {
            setIsLoading(true);
            setIsDisabled(true);
            await signUpUser({ login: nickname, email, password }).unwrap();
          } else if (!nicknameMatcher.test(nickname)) {
            setNicknameError(true);
          }
        } catch (error) {
          errorHandler(error);
          setIsLoading(false);
          setIsDisabled(false);
        } finally {
          setIsLoading(false);
          setIsDisabled(false);
        }
      }}
      disabled={isDisabled}>
      {`Register${isLoading ? 'ing' : ''}`}
    </Button>
  );
}
