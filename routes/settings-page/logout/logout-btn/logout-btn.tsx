import { useRouter } from 'expo-router';
import { ROUTES } from '@const/enums';
import { useLogoutMutation } from '@R/services/authentication/authentication';
import { useUnregisterPushTokenMutation } from '@R/services/notifications/notifications';
import { persistor, resetStore } from '@R/store';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { SETTINGS } from '../../const';
import SettingsRow from '../../settings-row/settings-row';

export default function LogoutBtn() {
  const { language } = useAppSelector(({ settings }) => settings);
  const { replace, dismissAll, canDismiss } = useRouter();
  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();
  const [unregisterPushToken] = useUnregisterPushTokenMutation();
  return (
    <SettingsRow
      icon="logout"
      title={SETTINGS[language].logout}
      destructive
      onPress={async () => {
        let serverLogoutError: unknown;
        let pushCleanupError: unknown;

        try {
          await unregisterPushToken().unwrap();
        } catch (error) {
          pushCleanupError = error;
        }

        try {
          await logout().unwrap();
        } catch (error) {
          serverLogoutError = error;
        }

        try {
          await persistor.purge();
          dispatch(resetStore());
          if (canDismiss()) {
            dismissAll();
          }
          replace(`/${ROUTES.signIn}`);

          if (serverLogoutError) {
            errorToast('Сессия очищена на устройстве, но сервер не подтвердил выход', serverLogoutError);
          }
          if (pushCleanupError) {
            errorToast('Не удалось отключить push на сервере; проверьте подключение к интернету', pushCleanupError);
          }
        } catch (error) {
          errorToast('Не удалось выйти из аккаунта', error);
        }
      }}
    />
  );
}
