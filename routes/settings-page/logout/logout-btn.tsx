import { useRouter } from 'expo-router';
import { persistor, resetStore } from '@R/store';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { SETTINGS } from '../const';
import SettingsRow from '../settings-row/settings-row';

export default function LogoutBtn() {
  const { language } = useAppSelector(({ language }) => language);
  const { replace } = useRouter();
  const dispatch = useAppDispatch();
  return (
    <SettingsRow
      icon="logout"
      title={SETTINGS[language].logout}
      destructive
      onPress={async () => {
        try {
          await persistor.purge();
          dispatch(resetStore());
          replace('/sign-in');
        } catch (error) {
          errorToast('Не удалось выйти из аккаунта', error);
        }
      }}
    />
  );
}
