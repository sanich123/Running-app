import { useState } from 'react';
import { Button, SegmentedButtons } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { useAuth } from '../../../auth/context/auth-context';
import { LANGUAGES } from '../../../constants/enums';
import { changeLanguage } from '../../../redux/language/language';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { language } = useSelector(({ language }) => language);
  const [languageValue, setLanguage] = useState(language);
  const dispatch = useDispatch();
  return (
    <>
      <SegmentedButtons
        value={languageValue}
        onValueChange={(value) => {
          setLanguage(value);
          dispatch(changeLanguage(value));
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
    </>
  );
}
