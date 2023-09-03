import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLinkTo } from '@react-navigation/native';
import { Tabs, usePathname } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Button } from 'react-native-paper';

import { useAuth } from '../../auth/context/auth-context';
import HeaderRight from '../../components/header-right/header-right';
import { useAuth } from '../../auth/context/auth-context';
import HeaderRight from '../../components/header-right/header-right';
import Colors from '../../constants/Colors';

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const pathname = usePathname();
  const linkTo = useLinkTo();
  console.log(pathname);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}>
      <Tabs.Screen
        name="home"
        redirect={!user}
        name="home"
        redirect={!user}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color }) => <TabBarIcon name="feed" color={color} />,
          headerStyle: { backgroundColor: '#f4511e' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => <HeaderRight />,
          headerRight: () => <HeaderRight />,
        }}
      />
      <Tabs.Screen
        name="activity"
        redirect={!user}
        redirect={!user}
        options={{
          tabBarLabel: 'Activity',
          tabBarIcon: ({ color }) => <TabBarIcon name="trophy" color={color} />,
          headerShown: false,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="progress"
        redirect={!user}
        redirect={!user}
        options={{
          title: 'progress',
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color }) => <TabBarIcon name="arrow-circle-up" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        redirect={!user}
        redirect={!user}
        options={{
          title: 'profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="wrench" color={color} />,
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
