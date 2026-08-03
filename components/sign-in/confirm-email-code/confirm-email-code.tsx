import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Button, TextInput, useTheme } from 'react-native-paper';
import type { UseFormWatch } from 'react-hook-form';
import { useConfirmSignUpCodeByEmailMutation } from '@R/services/authentication/authentication';
import { showCrossPlatformToast } from '@U/custom-toast';
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
        mode="outlined"
        placeholder="Введите код подтверждения с почты"
        onChangeText={(text) => setConfirmationCode(text)}
        style={{ marginTop: 12, fontSize: 14, opacity: isLoading ? 0.7 : 1 }}
        disabled={isLoading}
        outlineColor={dark ? primary : onBackground}
        activeOutlineColor={primary}
        multiline={false}
      />
      <Button
        mode="contained"
        onPress={async () =>
          await confirmEmailByCode({ email: watch('email'), confirmationCode })
            .unwrap()
            .then(() => replace('/'))
            .catch((error) => showCrossPlatformToast(error.data.message))
        }
        loading={isLoading}
        disabled={isLoading}
        style={{ marginTop: 10 }}>
        Подтвердить код
      </Button>
    </>
  );
}
