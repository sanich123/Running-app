import ActivityCloseBtn from '@C/activity-close-btn/activity-close-btn';
import ActivitySaveBtn from '@C/activity-save-btn/activity-save-btn';
import AvatarShowable from '@C/avatar-showable/avatar-showable';
import { HomeIcon, ActivityIcon } from '@C/icons/icons';
import { useAppSelector } from '@R/typed-hooks';
import { LABELS, ROUTES } from '@const/enums';
import { useAuth } from 'auth/context/auth-context';
import { Tabs, usePathname } from 'expo-router';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function TabLayout() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);
  const { isCameraVisible } = useAppSelector(({ activity }) => activity);
  console.log(pathname);

  return (
    <Tabs
      screenOptions={{
        tabBarInactiveBackgroundColor: colors.primary,
        tabBarActiveBackgroundColor: colors.primary,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 80,
        },
      }}>
      <Tabs.Screen
        name={ROUTES.home}
        options={{
          tabBarLabelStyle: { color: colors.primaryContainer },
          title: '',
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name={ROUTES.activity}
        options={{
          title: '',
          tabBarStyle: {
            display: 'none',
          },
          headerTitleStyle: { fontWeight: 'bold' },
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.primaryContainer,
          tabBarLabelStyle: { color: colors.primaryContainer },
          headerLeft: () => <ActivityCloseBtn />,
          tabBarIcon: ({ focused }) => <ActivityIcon focused={focused} />,
        }}
      />
      {user && (
        <Tabs.Screen
          name={ROUTES.profile}
          options={{
            title: '',
            tabBarIcon: ({ focused }) => (
              <View style={{ paddingTop: 12 }}>
                <AvatarShowable size={focused ? 50 : 45} id={user.id} />
              </View>
            ),
            tabBarLabelStyle: { color: colors.primaryContainer },
            headerShown: false,
          }}
        />
      )}
      <Tabs.Screen
        name={`${ROUTES.settings}/${ROUTES.index}`}
        options={{
          title: LABELS[language].settings,
          tabBarLabelStyle: { color: colors.primaryContainer },
          headerTitleStyle: { fontWeight: 'bold' },
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.primaryContainer,
          href: null,
        }}
      />
      <Tabs.Screen
        name={`${ROUTES.users}/${ROUTES.index}`}
        options={{
          title: LABELS[language].users,
          tabBarLabelStyle: { color: colors.primaryContainer },
          headerTitleStyle: { fontWeight: 'bold' },
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.primaryContainer,
          href: null,
        }}
      />
      <Tabs.Screen
        name={`${ROUTES.saveActivity}/${ROUTES.index}`}
        options={{
          title: '',
          tabBarLabelStyle: { color: colors.primaryContainer },
          headerTitleStyle: { fontWeight: 'bold' },
          href: null,
          headerShown: !isCameraVisible,
          headerRight: !isCameraVisible ? () => <ActivitySaveBtn /> : undefined,
        }}
      />
    </Tabs>
  );
}
