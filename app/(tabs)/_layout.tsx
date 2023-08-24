import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs, usePathname } from 'expo-router';
import { Pressable, useColorScheme } from 'react-native';

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
  console.log(pathname);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}>
      <Tabs.Screen
        name="home"
        redirect={!user}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color }) => <TabBarIcon name="feed" color={color} />,
          headerStyle: { backgroundColor: '#f4511e' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => <HeaderRight />,
        }}
      />
      <Tabs.Screen
        name="activity"
        redirect={!user}
        options={{
          tabBarLabel: 'Activity',
          tabBarIcon: ({ color }) => <TabBarIcon name="trophy" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="progress"
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
        options={{
          title: 'profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="wrench" color={color} />,
          headerRight: () => (
            <Link href="/profile/settings" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="wrench"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
    </Tabs>
  );
}
