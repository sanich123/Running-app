import { useLinkTo } from '@react-navigation/native';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { useColorScheme, Pressable } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '../../auth/context/auth-context';
import { View } from '../../components/Themed';
import AvatarShowable from '../../components/avatar/avatar-showable';
import Colors from '../../constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const linkTo = useLinkTo();
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
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons name="home" color={theme.colors.primaryContainer} size={focused ? 40 : 35} />
          ),
          headerTitleStyle: { fontWeight: 'bold' },

          headerRight: () => (
            <View style={{ display: 'flex', flexDirection: 'row', backgroundColor: 'transparent' }}>
              <MaterialCommunityIcons
                name="account-multiple"
                color={theme.colors.primaryContainer}
                size={30}
                style={{ marginRight: 5 }}
                onPress={() => router.push('/users')}
              />
              <MaterialCommunityIcons
                name="cog-outline"
                color={theme.colors.primaryContainer}
                size={30}
                style={{ marginRight: 5 }}
                onPress={() => router.push('/settings')}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        redirect={!user}
        options={{
          title: 'Activity',
          tabBarLabel: 'Activity',
          ...commonSettings,
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="record-circle-outline"
              color={theme.colors.primaryContainer}
              size={focused ? 40 : 35}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        redirect={!user}
        options={{
          ...commonSettings,
          title: 'Progress',
          tabBarLabel: 'Progress',
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons name="chart-bar" color={theme.colors.primaryContainer} size={focused ? 40 : 35} />
          ),
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
          headerRight: () =>
            pathname !== '/profile/settings' ? (
              <Pressable onPress={() => linkTo('/profile/settings')}>
                <Text variant="titleMedium" style={{ color: theme.colors.primaryContainer, marginRight: 15 }}>
                  Edit
                </Text>
              </Pressable>
            ) : null,
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
          title: 'save',
          ...commonSettings,
          headerTitleStyle: { fontWeight: 'bold' },
          href: null,
        }}
      />
    </Tabs>
  );
}
