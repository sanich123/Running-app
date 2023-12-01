import ActivityCloseBtn from '@C/activity-close-btn/activity-close-btn';
import ActivitySaveBtn from '@C/activity-save-btn/activity-save-btn';
import AvatarShowable from '@C/avatar-showable/avatar-showable';
import { HomeIcon, ActivityIcon, ProgressIcon } from '@C/icons/icons';
import ProfileEditBtn from '@C/profile-edit-btn/profile-edit-btn';
import ProfileUpdateBtn from '@C/profile-update-btn/profile-update-btn';
import UsersSettingsIcons from '@C/users-settings-icons/users-settings-icons';
import { useAppSelector } from '@R/typed-hooks';
import { LABELS, ROUTES } from '@const/enums';
import { useAuth } from 'auth/context/auth-context';
import { Tabs, usePathname } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useTheme } from 'react-native-paper';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const pathname = usePathname();
  const theme = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  const { isCameraVisible } = useAppSelector(({ activity }) => activity);
  const commonSettings = {
    tabBarLabelStyle: { color: theme.colors.primaryContainer },
    headerStyle: { backgroundColor: theme.colors.primary },
    headerTintColor: theme.colors.primaryContainer,
  };
  console.log(pathname);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          height: 60,
          elevation: 0,
          borderTopWidth: 0,
          display: pathname.includes(ROUTES.activity) ? 'none' : 'flex',
        },
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveBackgroundColor: theme.colors.primary,
        tabBarActiveBackgroundColor: theme.colors.primary,
        tabBarHideOnKeyboard: true,
      }}>
      <Tabs.Screen
        name={ROUTES.home}
        redirect={!user}
        options={{
          ...commonSettings,
          title: LABELS[language].feed,
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => <UsersSettingsIcons />,
          headerShown: pathname === `/${ROUTES.home}`,
        }}
      />
      <Tabs.Screen
        name={ROUTES.activity}
        redirect={!user}
        options={{
          title: '',
          tabBarLabel: LABELS[language].activity,
          ...commonSettings,
          headerLeft: () => <ActivityCloseBtn />,
          tabBarIcon: ({ focused }) => <ActivityIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name={ROUTES.progress}
        redirect={!user}
        options={{
          ...commonSettings,
          title: LABELS[language].statistics,
          tabBarLabel: LABELS[language].statistics,
          tabBarIcon: ({ focused }) => <ProgressIcon focused={focused} />,
        }}
      />
      {user && (
        <Tabs.Screen
          name={ROUTES.profile}
          redirect={!user}
          options={{
            ...commonSettings,
            title: LABELS[language].profile,
            tabBarLabel: LABELS[language].profile,
            tabBarIcon: () => <AvatarShowable size={30} id={user.id} />,
            headerTitleStyle: { fontWeight: 'bold' },
            headerRight: () =>
              pathname !== `/${ROUTES.profile}/${ROUTES.settings}` ? <ProfileEditBtn /> : <ProfileUpdateBtn />,
            headerShown: pathname === `/${ROUTES.profile}` || pathname === `/${ROUTES.profile}/${ROUTES.settings}`,
          }}
        />
      )}
      <Tabs.Screen
        name={`${ROUTES.settings}/${ROUTES.index}`}
        options={{
          title: LABELS[language].settings,
          ...commonSettings,
          headerTitleStyle: { fontWeight: 'bold' },
          href: null,
        }}
      />
      <Tabs.Screen
        name={`${ROUTES.users}/${ROUTES.index}`}
        options={{
          title: LABELS[language].users,
          ...commonSettings,
          headerTitleStyle: { fontWeight: 'bold' },
          href: null,
        }}
      />
      <Tabs.Screen
        name={`${ROUTES.saveActivity}/${ROUTES.index}`}
        options={{
          title: '',
          ...commonSettings,
          headerTitleStyle: { fontWeight: 'bold' },
          href: null,
          headerShown: !isCameraVisible,
          headerRight: !isCameraVisible ? () => <ActivitySaveBtn /> : undefined,
        }}
      />
    </Tabs>
  );
}
