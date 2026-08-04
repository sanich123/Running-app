import { Platform, View } from 'react-native';
import { Tabs, usePathname } from 'expo-router';
import { Icon, useTheme } from 'react-native-paper';
import AvatarShowable from '@C/avatar/showable/showable';
import { ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';

export default function TabLayout() {
  const { userId } = useAppSelector(({ auth }) => auth);
  const { colors } = useTheme();
  const pathname = usePathname();

  const renderTabIcon = (source: string, focusedSource: string, focused: boolean, color?: string) => (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: 52,
        height: 40,
        borderRadius: 20,
        backgroundColor: focused ? colors.primaryContainer : 'transparent',
      }}>
      <Icon source={focused ? focusedSource : source} color={color ?? colors.primary} size={30} />
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceDisabled,
        tabBarAllowFontScaling: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outlineVariant,
          borderTopWidth: 1,
          elevation: 3,
          height: 64,
          paddingBottom: 6,
          paddingTop: 6,
          display: pathname === '/activity' ? 'none' : 'flex',
        },
        tabBarItemStyle: { paddingVertical: 4 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarAccessibilityLabel: 'Лента',
          tabBarIcon: ({ focused }) => renderTabIcon('home-outline', 'home-variant', focused),
        }}
      />
      <Tabs.Screen
        name={ROUTES.activity}
        options={{
          href: Platform.OS === 'web' ? null : undefined,
          tabBarAccessibilityLabel: 'Активность',
          headerShown: false,
          tabBarIcon: ({ focused }) => renderTabIcon('run-fast', 'run-fast', focused, focused ? colors.tertiary : colors.primary),
        }}
      />
      <Tabs.Screen
        name={ROUTES.statistic}
        options={{
          headerShown: false,
          tabBarAccessibilityLabel: 'Статистика',
          tabBarIcon: ({ focused }) => renderTabIcon('chart-line', 'chart-line', focused),
        }}
      />
      <Tabs.Screen
        name={ROUTES.profile}
        options={{
          tabBarAccessibilityLabel: 'Профиль',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 52,
                height: 40,
                borderRadius: 20,
                backgroundColor: focused ? colors.primaryContainer : 'transparent',
              }}>
              <AvatarShowable size={34} id={userId} focused={focused} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
