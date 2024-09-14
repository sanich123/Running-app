import { useState } from 'react';
import { SegmentedButtons } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { LANGUAGES } from '@const/enums';
import { SETTINGS } from '../const';
import { changeLanguage } from '@R/language/language';

export default function LanguageSwitcher() {
  const { language } = useAppSelector(({ language }) => language);
  const dispatch = useAppDispatch();
  const [languageValue, setLanguage] = useState<string>(language);
  return (
    <SegmentedButtons
      value={languageValue}
      onValueChange={(value: string) => {
        setLanguage(value);
        dispatch(changeLanguage(value));
      }}
      buttons={[
        {
          value: LANGUAGES.english,
          label: SETTINGS[language].eng,
        },
        {
          value: LANGUAGES.russian,
          label: SETTINGS[language].rus,
        },
      ]}
    />
  );
}
