import { Text, Switch } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '@A/context/auth-context';
import { useGetUserProfileByUserIdQuery, useUpdateProfileByProfileIdMutation } from '@R/runich-api/runich-api';
import { SETTINGS } from '../const';
import { useAppSelector } from '@R/typed-hooks';

export default function EmailNotificationsBtn() {
  const { user } = useAuth();
  const { language } = useAppSelector(({ language }) => language);
  const { data: profileInfo, isSuccess } = useGetUserProfileByUserIdQuery(`${user?.id}`, { skip: !user?.id });
  const [updateProfile] = useUpdateProfileByProfileIdMutation();

  return (
    <>
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
    </>
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
