import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Button, SegmentedButtons } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { useAuth } from '../../../auth/context/auth-context';
import { LANGUAGES } from '../../../constants/enums';
import { changeLanguage } from '../../../redux/language/language';
import { runichApi } from '../../../redux/runich-api/runich-api';
import { errorHandler } from '../../../utils/error-handler';

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
        onValueChange={(value) => {
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
