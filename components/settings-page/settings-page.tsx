import { changeLanguage } from '@R/language/language';
import { resetSettings, setisNeedToPrefetchActivities } from '@R/profile/profile';
import { runichApi, useGetUserProfileByIdQuery, useUpdateProfileInfoMutation } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { LANGUAGES } from '@const/enums';
import { useAuth } from 'auth/context/auth-context';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, Switch, Text } from 'react-native-paper';

import { SETTINGS } from './const';

export default function SettingsPage() {
  const { signOut, user } = useAuth();
  const { language } = useAppSelector(({ language }) => language);
  const { isNeedToPrefetchActivities } = useAppSelector(({ profile }) => profile);
  const [languageValue, setLanguage] = useState<string>(language);
  const dispatch = useAppDispatch();
  const { data: profileInfo, isSuccess } = useGetUserProfileByIdQuery(`${user?.id}`);
  const [updateProfile] = useUpdateProfileInfoMutation();

  return (
    <ScrollView contentContainerStyle={{ padding: 10, display: 'flex', gap: 15 }}>
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
      <Button mode="outlined" icon="logout" onPress={() => dispatch(runichApi.util.resetApiState())}>
        {SETTINGS[language].cache}
      </Button>
      <View style={styles.togglers}>
        <Text variant="titleSmall">{`${isNeedToPrefetchActivities ? SETTINGS[language].switchOn : SETTINGS[language].switchOff} ${SETTINGS[language].prefetch}`}</Text>
        <Switch
          value={isNeedToPrefetchActivities}
          onValueChange={() => {
            dispatch(setisNeedToPrefetchActivities());
          }}
        />
      </View>
      {isSuccess && (
        <View style={styles.togglers}>
          <Text variant="titleSmall">{`${profileInfo?.emailNotifications ? SETTINGS[language].switchOn : SETTINGS[language].switchOff} ${SETTINGS[language].emailNotifications}`}</Text>
          <Switch
            value={profileInfo?.emailNotifications}
            onValueChange={async () => {
              await updateProfile({
                body: { emailNotifications: !profileInfo?.emailNotifications },
                id: profileInfo.id,
              });
            }}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  togglers: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 15,
    gap: 10,
  },
});
