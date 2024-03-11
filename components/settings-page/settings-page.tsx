import { changeLanguage } from '@R/language/language';
import { resetSettings, setisNeedToPrefetchActivities } from '@R/profile/profile';
import { runichApi, useGetUserProfileByIdQuery, useUpdateProfileInfoMutation } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { storeData } from '@U/async-storage';
import { LANGUAGES } from '@const/enums';
import { useAuth } from 'auth/context/auth-context';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, SegmentedButtons, Switch, Text } from 'react-native-paper';

export default function SettingsPage() {
  const { signOut, user } = useAuth();
  const { language } = useAppSelector(({ language }) => language);
  const { isNeedToPrefetchActivities } = useAppSelector(({ profile }) => profile);
  const [languageValue, setLanguage] = useState<string>(language);
  const dispatch = useAppDispatch();
  const { data: profileInfo, isSuccess } = useGetUserProfileByIdQuery(`${user?.id}`);
  const [updateProfile] = useUpdateProfileInfoMutation();

  return (
    <>
      <SegmentedButtons
        value={languageValue}
        onValueChange={(value: string) => {
          setLanguage(value);
          dispatch(changeLanguage(value));
          storeData(value, 'language');
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
      {signOut && (
        <Button
          mode="outlined"
          icon="logout"
          onPress={() => {
            dispatch(resetSettings());
            signOut();
          }}
          style={{ marginTop: 15 }}>
          LogOut
        </Button>
      )}
      <Button
        mode="outlined"
        icon="logout"
        onPress={() => dispatch(runichApi.util.resetApiState())}
        style={{ marginTop: 15 }}>
        Clear cache manually
      </Button>
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
        <Switch
          value={isNeedToPrefetchActivities}
          onValueChange={() => {
            dispatch(setisNeedToPrefetchActivities());
          }}
        />
        <Text variant="titleSmall">{`${isNeedToPrefetchActivities ? 'Выключить' : 'Включить'} предзагрузку тренировок в ленте`}</Text>
      </View>
      {isSuccess && (
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
          <Switch
            value={profileInfo?.emailNotifications}
            onValueChange={async () => {
              await updateProfile({
                body: { emailNotifications: !profileInfo?.emailNotifications },
                id: profileInfo.id,
              });
            }}
          />
          <Text variant="titleSmall">{`${profileInfo?.emailNotifications ? 'Выключить' : 'Включить'} уведомления по email`}</Text>
        </View>
      )}
    </>
  );
}
