import AvatarShowable from '@C/avatar/showable/showable';
import { ActivityIcon, HomeIcon } from '@C/icons/icons';
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
        // tabBarInactiveBackgroundColor: colors.primary,
        // tabBarActiveBackgroundColor: colors.onPrimaryContainer,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: Platform.OS === 'android' ? 72 : 82,
          backgroundColor: colors.secondaryContainer,
          borderTopWidth: 0,
          display:
            pathname.includes(ROUTES.manualActivity) || pathname.includes('change-password') || Platform.OS === 'web'
              ? 'none'
              : 'flex',
        },
      }}>
      <Tabs.Screen
        name={ROUTES.home}
        options={{
          ...commonSettings,
          tabBarIcon: ({ focused }) => (
            <View style={[{ marginTop: Platform.OS === 'ios' ? 25 : 0, opacity: !focused ? 0.5 : 1 }]}>
              <HomeIcon focused={focused} />
            </View>
          ),
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
                style={[
                  {
                    marginTop: Platform.OS === 'ios' ? 25 : 0,
                  },
                  focused && {
                    borderRadius: 27,
                    backgroundColor: 'white',
                    width: 54,
                    height: 54,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}>
                <AvatarShowable size={45} id={user.id} />
              </View>
            ),
          }}
        />
      )}
    </Tabs>
  );
}
