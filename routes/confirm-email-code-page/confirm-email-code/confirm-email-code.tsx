import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, TextInput, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import {
  useConfirmSignUpCodeByEmailMutation,
  useVerifyPasswordChangeCodeMutation,
} from '@R/services/authentication/authentication';
import { setAccessToken, setRefreshToken, setUserId } from '@R/slices/auth/auth';
import { useAppDispatch } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { CONFIRM_EMAIL_CODE_TEST_ID, CONFIRM_EMAIL_CODE_TEXT } from './const';
import type { ConfirmEmailCodeProps } from './types';

export default function ConfirmEmailCode({ email, type = 'registration' }: ConfirmEmailCodeProps) {
  const dispatch = useAppDispatch();
  const [confirmationCode, setConfirmationCode] = useState('');
  const [confirmEmailByCode, { isLoading: isConfirmingRegistration }] = useConfirmSignUpCodeByEmailMutation();
  const [verifyPasswordChangeCode, { isLoading: isVerifyingPasswordChangeCode }] =
    useVerifyPasswordChangeCodeMutation();
  const { push, replace } = useRouter();
  const isLoading = isConfirmingRegistration || isVerifyingPasswordChangeCode;
  const {
    colors: { primary, onBackground },
    dark,
  } = useTheme();

  const handleSubmit = async () => {
    if (!confirmationCode.trim() || isLoading) {
      return;
    }

    const code = confirmationCode.trim();
    if (type === 'change-password') {
      verifyPasswordChangeCode({ email, confirmationCode: code })
        .unwrap()
        .then(() => push({ pathname: `/${ROUTES.changePassword}`, params: { email } }))
        .catch((error) => errorToast(CONFIRM_EMAIL_CODE_TEXT.error, error));
    } else {
      confirmEmailByCode({ email, confirmationCode: code })
        .unwrap()
        .then(({ userId, accessToken, refreshToken }) => {
          dispatch(setUserId(userId));
          dispatch(setAccessToken(accessToken));
          dispatch(setRefreshToken(refreshToken));
          replace(ROUTES.root);
        })
        .catch((error) => errorToast(CONFIRM_EMAIL_CODE_TEXT.error, error));
    }
  };

  return (
    <View style={styles.form}>
      <TextInput
        testID={CONFIRM_EMAIL_CODE_TEST_ID.input}
        mode="outlined"
        placeholder={CONFIRM_EMAIL_CODE_TEXT.placeholder}
        value={confirmationCode}
        onChangeText={(text) => setConfirmationCode(text)}
        style={[styles.input, { opacity: isLoading ? 0.7 : 1 }]}
        contentStyle={styles.inputContent}
        disabled={isLoading}
        outlineColor={dark ? primary : onBackground}
        activeOutlineColor={primary}
        multiline={false}
      />
      <Button
        testID={CONFIRM_EMAIL_CODE_TEST_ID.submit}
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading || !confirmationCode.trim()}
        style={styles.submit}
        contentStyle={styles.submitContent}>
        {!isLoading && CONFIRM_EMAIL_CODE_TEXT.submit}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { alignSelf: 'stretch', marginTop: 16 },
  input: { height: 56, width: '100%' },
  inputContent: { height: 54, paddingVertical: 0 },
  submit: { marginTop: 12, width: '100%' },
  submitContent: { minHeight: 48 },
});
