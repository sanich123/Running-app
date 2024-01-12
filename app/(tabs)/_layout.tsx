import AvatarShowable from '@C/avatar-showable/avatar-showable';
import { HomeIcon, ActivityIcon } from '@C/icons/icons';
import { ROUTES } from '@const/enums';
import { useAuth } from 'auth/context/auth-context';
import { Tabs, usePathname } from 'expo-router';
import { Platform, View } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function TabLayout() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { colors } = useTheme();
  const commonSettings = {
    title: '',
    headerShown: false,
  };
  console.log(pathname);

  return (
    <Tabs
      screenOptions={{
        tabBarInactiveBackgroundColor: colors.primary,
        tabBarActiveBackgroundColor: colors.primary,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: Platform.OS === 'android' ? 55 : 80,
        },
      }}>
      <Tabs.Screen
        name={ROUTES.home}
        options={{
          ...commonSettings,
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
          tabBarStyle: {
            display: pathname.includes(ROUTES.manualActivity) ? 'none' : 'flex',
          },
        }}
      />
      <Tabs.Screen
        name={ROUTES.activity}
        options={{
          ...commonSettings,
          tabBarIcon: ({ focused }) => <ActivityIcon focused={focused} />,
          tabBarStyle: {
            display: 'none',
          },
        }}
      />
      {user && (
        <Tabs.Screen
          name={ROUTES.profile}
          options={{
            ...commonSettings,
            tabBarIcon: ({ focused }) => (
              <View style={{ paddingTop: 12 }}>
                <AvatarShowable size={focused ? 50 : 45} id={user.id} />
              </View>
            ),
          }}
        />
      )}
    </Tabs>
  );
}
