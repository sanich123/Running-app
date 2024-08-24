import { useAuth } from '@A/context/auth-context';
import { Button } from 'react-native-paper';
import { SETTINGS } from '../const';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { resetSettings } from '@R/profile/profile';

export default function LogoutBtn() {
  const { signOut } = useAuth();
  const { language } = useAppSelector(({ language }) => language);
  const dispatch = useAppDispatch();
  return (
    <>
      {signOut && (
        <Button
          mode="outlined"
          icon="logout"
          onPress={() => {
            dispatch(resetSettings());
            signOut();
          }}>
          {SETTINGS[language].logout}
        </Button>
      )}
    </>
  );
}
