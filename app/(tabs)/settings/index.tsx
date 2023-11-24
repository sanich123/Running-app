import { changeLanguage } from '@R/language/language';
import { runichApi } from '@R/runich-api/runich-api';
import { errorHandler } from '@U/error-handler';
import { LANGUAGES } from '@const/enums';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from 'auth/context/auth-context';
import { useState } from 'react';
import { Button, SegmentedButtons } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { language } = useSelector(({ language }) => language);
  const [languageValue, setLanguage] = useState(language);
  const dispatch = useDispatch();

  async function setToAsyncStorage(key: string, value: LANGUAGES) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      errorHandler(error);
    }
  }
  return (
    <>
      <SegmentedButtons
        value={languageValue}
        onValueChange={(value: LANGUAGES) => {
          setLanguage(value);
          dispatch(changeLanguage(value));
          setToAsyncStorage('language', value);
        }}
        buttons={[
          {
            value: LANGUAGES.english,
            label: 'English',
          },
          {
            value: LANGUAGES.russian,
            label: 'Russian',
          },
        ]}
        style={{ marginTop: 15 }}
      />
      <Button mode="outlined" icon="logout" onPress={() => signOut()} style={{ marginTop: 15 }}>
        LogOut
      </Button>
      <Button
        mode="outlined"
        icon="logout"
        onPress={() => dispatch(runichApi.util.resetApiState())}
        style={{ marginTop: 15 }}>
        Clear cache manually
      </Button>
    </>
  );
}
