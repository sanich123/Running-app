import { Text, Switch, Divider, useTheme, TouchableRipple } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { useGetUserProfileByUserIdQuery, useUpdateProfileByProfileIdMutation } from '@R/services/profile/profile';
import { SETTINGS } from '../const';
import { useAppSelector } from '@R/typed-hooks';

export default function EmailNotificationsBtn() {
  const { dark } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ language }) => language);
  const { data: profileInfo, isSuccess } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  const [updateProfile] = useUpdateProfileByProfileIdMutation();

  return (
    <>
      {isSuccess && (
        <TouchableRipple rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`} borderless>
          <View style={styles.togglers}>
            <Text variant="titleSmall">{`${profileInfo?.emailNotifications ? SETTINGS[language].switchOff : SETTINGS[language].switchOn} ${SETTINGS[language].emailNotifications}`}</Text>
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
        </TouchableRipple>
      )}
      <Divider />
    </>
  );
}

const styles = StyleSheet.create({
  togglers: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
    padding: 10,
  },
});
