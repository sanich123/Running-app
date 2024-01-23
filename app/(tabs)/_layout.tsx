import AvatarShowable from '@C/avatar-showable/avatar-showable';
import { ActivityIcon, HomeIcon } from '@C/icons/icons';
import { ROUTES } from '@const/enums';
import { useAuth } from 'auth/context/auth-context';
import { Tabs, usePathname } from 'expo-router';
// import { Platform, View } from 'react-native';
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
        tabBarInactiveBackgroundColor: colors.onBackground,
        tabBarActiveBackgroundColor: colors.primary,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
        tabBarStyle: {
          borderRadius: 20,
        },
      }}>
      <Tabs.Screen
        name={ROUTES.home}
        options={{
          ...commonSettings,
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
          tabBarStyle: {
            display: pathname.includes(ROUTES.manualActivity) ? 'none' : 'flex',
            height: 60,
            position: 'absolute',
            bottom: 16,
            right: 16,
            left: 16,
            borderTopWidth: 0,
          },
          tabBarShowLabel: false,
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
            tabBarIcon: ({ focused }) => <AvatarShowable size={45} id={user.id} />,
            tabBarStyle: {
              height: 60,
              position: 'absolute',
              bottom: 16,
              right: 16,
              left: 16,
              borderTopWidth: 0,
            },
          }}
        />
      )}
    </Tabs>
  );
}
