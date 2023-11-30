import ActivityCloseBtn from '@C/activity-close-btn/activity-close-btn';
import ActivitySaveBtn from '@C/activity-save-btn/activity-save-btn';
import AvatarShowable from '@C/avatar-showable/avatar-showable';
import { HomeIcon, ActivityIcon, ProgressIcon } from '@C/icons/icons';
import ProfileEditBtn from '@C/profile-edit-btn/profile-edit-btn';
import ProfileUpdateBtn from '@C/profile-update-btn/profile-update-btn';
import UsersSettingsIcons from '@C/users-settings-icons/users-settings-icons';
import { useAppSelector } from '@R/typed-hooks';
import { LANGUAGES } from '@const/enums';
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
          display: pathname.includes('activity') ? 'none' : 'flex',
        },
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveBackgroundColor: theme.colors.primary,
        tabBarActiveBackgroundColor: theme.colors.primary,
        tabBarHideOnKeyboard: true,
      }}>
      <Tabs.Screen
        name="home"
        redirect={!user}
        options={{
          ...commonSettings,
          title: language === LANGUAGES.english ? 'Feed' : 'Лента',
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => <UsersSettingsIcons />,
          headerShown: pathname === '/home',
        }}
      />
      <Tabs.Screen
        name="activity"
        redirect={!user}
        options={{
          title: '',
          tabBarLabel: 'Activity',
          ...commonSettings,
          headerLeft: () => <ActivityCloseBtn />,
          tabBarIcon: ({ focused }) => <ActivityIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        redirect={!user}
        options={{
          ...commonSettings,
          title: 'Progress',
          tabBarLabel: 'Progress',
          tabBarIcon: ({ focused }) => <ProgressIcon focused={focused} />,
        }}
      />
      {user && (
        <Tabs.Screen
          name="profile"
          redirect={!user}
          options={{
            ...commonSettings,
            title: language === LANGUAGES.english ? 'Profile' : 'Профиль',
            tabBarLabel: 'Profile',
            tabBarIcon: () => <AvatarShowable size={30} id={user.id} />,
            headerTitleStyle: { fontWeight: 'bold' },
            headerRight: () => (pathname !== '/profile/settings' ? <ProfileEditBtn /> : <ProfileUpdateBtn />),
            headerShown: pathname === '/profile' || pathname === '/profile/settings',
          }}
        />
      )}
      <Tabs.Screen
        name="settings/index"
        options={{
          title: language === LANGUAGES.english ? 'Settings' : 'Настройки',
          ...commonSettings,
          headerTitleStyle: { fontWeight: 'bold' },
          href: null,
        }}
      />
      <Tabs.Screen
        name="users/index"
        options={{
          title: language === LANGUAGES.english ? 'Users' : 'Пользователи',
          ...commonSettings,
          headerTitleStyle: { fontWeight: 'bold' },
          href: null,
        }}
      />
      <Tabs.Screen
        name="save-activity/index"
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
