import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, TextInput, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useConfirmSignUpCodeByEmailMutation } from '@R/services/authentication/authentication';
import { errorToast } from '@S/error-toast/error-toast';
import { CONFIRM_EMAIL_CODE_TEST_ID, CONFIRM_EMAIL_CODE_TEXT } from './const';

export default function ConfirmEmailCode({ email }: { email: string }) {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [confirmEmailByCode, { isLoading }] = useConfirmSignUpCodeByEmailMutation();
  const { replace } = useRouter();
  const {
    colors: { primary, onBackground },
    dark,
  } = useTheme();

  const handleSubmit = async () => {
    if (!confirmationCode.trim() || isLoading) {
      return;
    }

    try {
      await confirmEmailByCode({
        email,
        confirmationCode: confirmationCode.trim(),
      }).unwrap();
      replace(ROUTES.root);
    } catch (error) {
      errorToast(CONFIRM_EMAIL_CODE_TEXT.error, error);
    }
  };

  return (
    <View style={styles.form}>
      <TextInput
        testID={CONFIRM_EMAIL_CODE_TEST_ID.input}
        mode="outlined"
        placeholder={CONFIRM_EMAIL_CODE_TEXT.placeholder}
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
