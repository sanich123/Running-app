import { useAuth } from '@A/context/auth-context';
import ActivitySaveBtn from '@C/activity-save-btn/activity-save-btn';
import ProfileEditBtn from '@C/profile-edit-btn/profile-edit-btn';
import ProfileUpdateBtn from '@C/profile-update-btn/profile-update-btn';
import UsersSettingsIcons from '@C/users-settings-icons/users-settings-icons';
import { useAppSelector } from '@R/typed-hooks';
import { LABELS, ROUTES } from '@const/enums';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default function ProfileStack() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  const { isCameraVisible } = useAppSelector(({ activity }) => activity);
  const { user } = useAuth();

  return (
    <Stack
      initialRouteName="index/profile"
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.primaryContainer,
        headerTitleStyle: { fontWeight: 'bold' },
        title: LABELS[language].profile,
      }}>
      <Stack.Screen
        name={`${ROUTES.index}`}
        options={{
          headerRight: () => user && <ProfileEditBtn />,
        }}
      />
      <Stack.Screen
        name={`${ROUTES.followers}/[id]`}
        options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].followers }}
      />
      <Stack.Screen
        name={`${ROUTES.following}/[id]`}
        options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].followings }}
      />
      <Stack.Screen
        name={`${ROUTES.media}/[photoUrl]`}
        options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].photo }}
      />
      <Stack.Screen
        name={`${ROUTES.mediaGrid}/[id]`}
        options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].photos }}
      />
      <Stack.Screen
        name={`${ROUTES.profileSettings}/index`}
        options={{
          title: LABELS[language].profileSettings,
          headerRight: () => user && <ProfileUpdateBtn />,
        }}
      />
      <Stack.Screen
        name={`${ROUTES.settings}/${ROUTES.index}`}
        options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].settings }}
      />
      <Stack.Screen
        name={`${ROUTES.users}/${ROUTES.index}`}
        options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].users }}
      />
      <Stack.Screen
        name={`${ROUTES.profile}/[id]`}
        options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].profile }}
      />
      <Stack.Screen
        name={`${ROUTES.activity}/[id]`}
        options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].activity }}
      />
      <Stack.Screen
        name={`${ROUTES.map}/[id]`}
        options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].map }}
      />
      <Stack.Screen
        name={`${ROUTES.comment}/[id]`}
        options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].comment }}
      />
      <Stack.Screen
        name={`${ROUTES.likes}/[id]`}
        options={{ headerRight: () => <UsersSettingsIcons />, title: LABELS[language].likes }}
      />
      <Stack.Screen
        name={`${ROUTES.manualActivity}/${ROUTES.index}`}
        options={{
          headerRight: () => <ActivitySaveBtn />,
          presentation: 'modal',
          title: '',
          headerShown: !isCameraVisible,
        }}
      />
    </Stack>
  );
}
