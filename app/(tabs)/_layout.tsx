import AvatarShowable from '@C/avatar-showable/avatar-showable';
import { ActivityIcon, HomeIcon } from '@C/icons/icons';
import { ROUTES } from '@const/enums';
import { useAuth } from 'auth/context/auth-context';
import { Tabs, usePathname } from 'expo-router';
// import { Platform, View } from 'react-native';
import { View } from 'react-native';
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
        // tabBarInactiveBackgroundColor: colors.onBackground,
        // tabBarActiveBackgroundColor: colors.primary,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 16,
          right: 12,
          left: 12,
          height: 72,
          elevation: 0,
          backgroundColor: colors.primary,
          borderRadius: 10,
          borderTopWidth: 0,
          display: pathname.includes(ROUTES.manualActivity) || pathname.includes(ROUTES.activity) ? 'none' : 'flex',
        },
      }}>
      <Tabs.Screen
        name={ROUTES.home}
        options={{
          ...commonSettings,
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name={ROUTES.activity}
        options={{
          ...commonSettings,
          tabBarIcon: ({ focused }) => <ActivityIcon focused={focused} />,
        }}
      />
      {user && (
        <Tabs.Screen
          name={ROUTES.profile}
          options={{
            ...commonSettings,
            tabBarIcon: ({ focused }) => (
              <View
                style={
                  focused && {
                    borderRadius: 25,
                    backgroundColor: 'white',
                    width: 50,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }
                }>
                <AvatarShowable size={45} id={user.id} />
              </View>
            ),
          }}
        />
      )}
    </Tabs>
  );
}
