import { Tabs, usePathname } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useTheme} from 'react-native-paper';

import { useAuth } from '../../auth/context/auth-context';
import ActivityCloseBtn from '../../components/activity-close-btn/activity-close-btn';
import ActivitySaveBtn from '../../components/activity-save-btn/activity-save-btn';
import AvatarShowable from '../../components/avatar/avatar-showable';
import { ActivityIcon, HomeIcon, ProgressIcon } from '../../components/icons/icons';
import ProfileEditBtn from '../../components/profile-edit-btn/profile-edit-btn';
import ProfileUpdateBtn from '../../components/profile-update-btn/profile-update-btn';
import UsersSettingsIcons from '../../components/users-settings-icons/users-settings-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const pathname = usePathname();
  const theme = useTheme();
  const commonSettings = {
    tabBarLabelStyle: { color: theme.colors.primaryContainer },
    headerStyle: { backgroundColor: theme.colors.primary },
    headerTintColor: theme.colors.primaryContainer,
  };

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
          title: 'Feed',
          tabBarLabel: 'Feed',
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => <UsersSettingsIcons />,
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
      <Tabs.Screen
        name="profile"
        redirect={!user}
        options={{
          ...commonSettings,
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: () => <AvatarShowable size={30} id={user.id} />,
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => (pathname !== '/profile/settings' ? <ProfileEditBtn /> : <ProfileUpdateBtn />),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Settings',
          ...commonSettings,
          headerTitleStyle: { fontWeight: 'bold' },
          href: null,
        }}
      />
      <Tabs.Screen
        name="users/index"
        options={{
          title: 'Users',
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
          headerRight: () => <ActivitySaveBtn />,
        }}
      />
    </Tabs>
  );
}
