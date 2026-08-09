import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Button, TextInput, useTheme } from 'react-native-paper';
import type { UseFormWatch } from 'react-hook-form';
import { ROUTES } from '@const/enums';
import { useConfirmSignUpCodeByEmailMutation } from '@R/services/authentication/authentication';
import { errorToast } from '@S/error-toast/error-toast';
import { CONFIRM_EMAIL_CODE_TEST_ID, CONFIRM_EMAIL_CODE_TEXT } from './const';
import type { EmailPasswordData } from '@R/services/authentication/types';

export default function ConfirmEmailCode({ watch }: { watch: UseFormWatch<EmailPasswordData> }) {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [confirmEmailByCode, { isLoading }] = useConfirmSignUpCodeByEmailMutation();
  const { replace } = useRouter();
  const {
    colors: { primary, onBackground },
    dark,
  } = useTheme();
  return (
    <>
      <TextInput
        testID={CONFIRM_EMAIL_CODE_TEST_ID.input}
        mode="outlined"
        placeholder={CONFIRM_EMAIL_CODE_TEXT.placeholder}
        onChangeText={(text) => setConfirmationCode(text)}
        style={{ marginTop: 12, fontSize: 14, opacity: isLoading ? 0.7 : 1 }}
        disabled={isLoading}
        outlineColor={dark ? primary : onBackground}
        activeOutlineColor={primary}
        multiline={false}
      />
      <Button
        testID={CONFIRM_EMAIL_CODE_TEST_ID.submit}
        mode="contained"
        onPress={async () =>
          await confirmEmailByCode({ email: watch('email'), confirmationCode })
            .unwrap()
            .then(() => replace(ROUTES.root))
            .catch((error) => errorToast(CONFIRM_EMAIL_CODE_TEXT.error, error))
        }
        loading={isLoading}
        disabled={isLoading}
        style={{ marginTop: 10 }}>
        {!isLoading && CONFIRM_EMAIL_CODE_TEXT.submit}
      </Button>
    </>
  );
}
