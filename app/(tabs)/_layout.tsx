import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLinkTo } from '@react-navigation/native';
import { Tabs, usePathname } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';

import { useAuth } from '../../auth/context/auth-context';
import AvatarShowable from '../../components/avatar/avatar-showable';
import Colors from '../../constants/Colors';

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { id } = useSelector(({ userInfo }) => userInfo);
  const { user } = useAuth();
  const pathname = usePathname();
  const linkTo = useLinkTo();
  const theme = useTheme();
  console.log(pathname);
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { height: 60 },
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveBackgroundColor: theme.colors.primary,
        tabBarActiveBackgroundColor: theme.colors.primary,
        tabBarHideOnKeyboard: true,
        // tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="home"
        redirect={!user}
        options={{
          title: 'Feed',
          tabBarLabel: 'Feed',
          tabBarLabelPosition: 'beside-icon',
          tabBarLabelStyle: { color: theme.colors.primaryContainer },
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name="home" color={theme.colors.primaryContainer} size={focused ? 40 : 35} />
          ),
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.primaryContainer,
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => (
            <MaterialCommunityIcons
              name="cog-outline"
              color={theme.colors.primaryContainer}
              size={30}
              style={{ marginRight: 5 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        redirect={!user}
        options={{
          title: 'Activity',
          tabBarLabel: 'Activity',
          tabBarLabelStyle: { color: theme.colors.primaryContainer },
          tabBarIcon: ({ color }) => <TabBarIcon name="trophy" color={color} />,
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTitleStyle: { fontWeight: 'bold' },
          headerTintColor: '#fff',
        }}
      />
      <Tabs.Screen
        name="progress"
        redirect={!user}
        options={{
          title: 'progress',
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color }) => <TabBarIcon name="arrow-circle-up" color={color} />,
          headerStyle: { backgroundColor: theme.colors.primary },
          tabBarLabelStyle: { color: theme.colors.primaryContainer },
          headerTintColor: theme.colors.primaryContainer,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Tabs.Screen
        name="profile"
        redirect={!user}
        options={{
          title: 'profile',
          tabBarLabel: 'Profile',
          tabBarIcon: () => <AvatarShowable size={30} id={id} />,
          tabBarLabelStyle: { color: theme.colors.primaryContainer },
          headerTintColor: theme.colors.primaryContainer,
          headerTitleStyle: { fontWeight: 'bold' },
          headerStyle: { backgroundColor: theme.colors.primary },
          headerRight: () =>
            pathname !== '/profile/settings' ? (
              <Button
                mode="outlined"
                icon="account-edit"
                onPress={() => linkTo('/profile/settings')}
                style={{ marginRight: 10 }}>
                Edit
              </Button>
            ) : null,
        }}
      />
    </Tabs>
  );
}
