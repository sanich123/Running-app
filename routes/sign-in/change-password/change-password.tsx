import { StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Surface, Text, useTheme } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { ROUTES } from '@const/enums';
import { useChangePasswordMutation } from '@R/services/authentication/authentication';
import { setAccessToken, setRefreshToken, setUserId } from '@R/slices/auth/auth';
import { useAppDispatch } from '@R/typed-hooks';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import CustomPasswordInput from '@S/custom-password-input/custom-password-input';
import { errorToast } from '@S/error-toast/error-toast';
import { changePasswordValidation, CHANGE_PASSWORD_TEST_ID, CHANGE_PASSWORD_TEXT } from './const';

interface ChangePasswordForm {
  password1: string;
  password2: string;
}

export default function ChangePassword() {
  const dispatch = useAppDispatch();
  const { replace } = useRouter();
  const { email: queryEmail } = useLocalSearchParams<{ email?: string }>();
  const email = typeof queryEmail === 'string' ? queryEmail : '';
  const { colors } = useTheme();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const { control, handleSubmit, setError } = useForm<ChangePasswordForm>({
    defaultValues: { password1: '', password2: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const submit = async ({ password1, password2 }: ChangePasswordForm) => {
    if (password1 !== password2) {
      setError('password2', { type: 'validate', message: CHANGE_PASSWORD_TEXT.mismatch });
      return;
    }

    changePassword({ password1, password2, email })
      .unwrap()
      .then(({ accessToken, userId, refreshToken }) => {
        dispatch(setAccessToken(accessToken));
        dispatch(setRefreshToken(refreshToken));
        dispatch(setUserId(userId));
        replace(ROUTES.root);
      })
      .catch((error) => errorToast('', error));
  };

  return (
    <>
      <Stack.Screen options={{ title: ROUTES.changePassword, headerShown: false }} />
      <CrossPlatformLayout edges={['top', 'bottom']} scrollViewEnabled>
        <View style={styles.container}>
          <Text variant="headlineSmall" style={styles.title}>
            {CHANGE_PASSWORD_TEXT.title}
          </Text>
          <Surface mode="flat" style={[styles.form, { backgroundColor: colors.surface }]}>
            <CustomPasswordInput<ChangePasswordForm>
              control={control}
              fieldName="password1"
              label={CHANGE_PASSWORD_TEXT.passwordLabel}
              placeholder={CHANGE_PASSWORD_TEXT.passwordPlaceholder}
              validation={changePasswordValidation}
              testID={CHANGE_PASSWORD_TEST_ID.input}
              visibilityTestID={CHANGE_PASSWORD_TEST_ID.visibility}
              autoCapitalize="none"
            />
            <CustomPasswordInput<ChangePasswordForm>
              control={control}
              fieldName="password2"
              label={CHANGE_PASSWORD_TEXT.confirmationLabel}
              placeholder={CHANGE_PASSWORD_TEXT.confirmationPlaceholder}
              validation={changePasswordValidation}
              testID={CHANGE_PASSWORD_TEST_ID.confirmationInput}
              visibilityTestID={CHANGE_PASSWORD_TEST_ID.confirmationVisibility}
              autoCapitalize="none"
            />
            <Text
              testID={CHANGE_PASSWORD_TEST_ID.requirements}
              variant="bodySmall"
              style={[styles.requirements, { color: colors.onSurfaceVariant }]}>
              {CHANGE_PASSWORD_TEXT.description}
            </Text>
            <Button
              testID={CHANGE_PASSWORD_TEST_ID.submit}
              mode="contained"
              onPress={handleSubmit(submit)}
              loading={isLoading}
              disabled={isLoading}
              contentStyle={styles.submitContent}
              style={styles.submit}>
              {!isLoading && CHANGE_PASSWORD_TEXT.submit}
            </Button>
          </Surface>
        </View>
      </CrossPlatformLayout>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    maxWidth: 420,
    padding: 20,
    width: '100%',
  },
  title: { fontWeight: '800', textAlign: 'center' },
  form: {
    alignSelf: 'stretch',
    borderRadius: 12,
    marginTop: 20,
    padding: 12,
  },
  requirements: { marginTop: 16 },
  submit: { marginTop: 20 },
  submitContent: { minHeight: 48 },
});
