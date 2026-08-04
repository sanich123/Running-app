import { Tabs, usePathname } from 'expo-router';
import { Icon, useTheme } from 'react-native-paper';
import AvatarShowable from '@C/avatar/showable/showable';
import { ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';

export default function TabLayout() {
  const { userId } = useAppSelector(({ auth }) => auth);
  const { colors } = useTheme();
  const pathname = usePathname();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceDisabled,
        tabBarAllowFontScaling: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outlineVariant,
          borderTopWidth: 1,
          elevation: 3,
          height: 72,
          paddingBottom: 8,
          paddingTop: 6,
          display: pathname === '/activity' ? 'none' : 'flex',
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              source={focused ? 'home' : 'home-outline'}
              color={focused ? colors.primary : colors.onSurfaceVariant}
              size={25}
            />
          ),
        }}
      />
      <Tabs.Screen
        name={ROUTES.activity}
        options={{
          tabBarLabel: 'Активность',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Icon
              source={focused ? 'run' : 'run-fast'}
              color={focused ? colors.primary : colors.onSurfaceVariant}
              size={25}
            />
          ),
        }}
      />
      <Tabs.Screen
        name={ROUTES.statistic}
        options={{
          headerShown: false,
          tabBarLabel: 'Статистика',
          tabBarIcon: ({ focused }) => (
            <Icon source="chart-donut" color={focused ? colors.primary : colors.onSurfaceVariant} size={25} />
          ),
        }}
      />
      <Tabs.Screen
        name={ROUTES.profile}
        options={{
          tabBarLabel: 'Профиль',
          headerShown: false,
          tabBarIcon: ({ focused }) => <AvatarShowable size={30} id={userId} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
