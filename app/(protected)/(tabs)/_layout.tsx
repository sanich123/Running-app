import { ROUTES } from '@const/enums';
import { Tabs, usePathname } from 'expo-router';
import { useTheme } from 'react-native-paper';
import AntDesign from '@expo/vector-icons/AntDesign';
import AvatarShowable from '@C/avatar/showable/showable';
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
          backgroundColor: colors.surfaceVariant,
          display: pathname === '/activity' ? 'none' : 'flex',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <AntDesign name="home" color={focused ? colors.primary : colors.onBackground} size={30} />
          ),
        }}
      />
      <Tabs.Screen
        name={ROUTES.activity}
        options={{
          tabBarLabel: 'Активность',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <AntDesign name="play-circle" color={focused ? colors.primary : colors.onBackground} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name={ROUTES.statistic}
        options={{
          headerShown: false,
          tabBarLabel: 'Статистика',
          tabBarIcon: ({ focused }) => (
            <AntDesign name="pie-chart" color={focused ? colors.primary : colors.onBackground} size={28} />
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
