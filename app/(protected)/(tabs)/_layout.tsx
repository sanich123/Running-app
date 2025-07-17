import { ROUTES } from '@const/enums';
import { useAuth } from '@A/context/utils';
import { Tabs, usePathname } from 'expo-router';
import { Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import AntDesign from '@expo/vector-icons/AntDesign';
import AvatarShowable from '@C/avatar/showable/showable';

export default function TabLayout() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const pathname = usePathname();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceDisabled,
        tabBarAllowFontScaling: false,
        tabBarShowLabel: false,
        tabBarLabelStyle: { fontSize: Platform.OS !== 'web' ? 12 : 10 },
        tabBarStyle: {
          backgroundColor: colors.surfaceVariant,
          display: pathname.includes('activity') ? 'none' : 'flex',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: () => <AntDesign name="home" color={colors.onBackground} size={30} />,
        }}
      />
      <Tabs.Screen
        name={ROUTES.activity}
        options={{
          headerShown: false,
          tabBarIcon: () => <AntDesign name="playcircleo" color={colors.onBackground} size={28} />,
        }}
      />
      <Tabs.Screen
        name={ROUTES.statistic}
        options={{
          headerShown: false,
          tabBarIcon: () => (
            <AntDesign name="piechart" color={colors.onBackground} size={28} style={{ margin: 0, padding: 0 }} />
          ),
        }}
      />
      <Tabs.Screen
        name={ROUTES.profile}
        options={{
          headerShown: false,
          tabBarIcon: () => <AvatarShowable size={30} id={`${user?.id}`} />,
        }}
      />
    </Tabs>
  );
}
