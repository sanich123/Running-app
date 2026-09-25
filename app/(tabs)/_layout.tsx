import { Suspense, useEffect } from 'react';
import { NativeTabs } from 'expo-router/native-tabs';
import { Platform, View } from 'react-native';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { Icon, useTheme } from 'react-native-paper';
import { LABELS, ROUTES, STATUSES } from '@const/enums';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import { LazyAvatarShowable, HOME_TAB_ROUTE } from '@Routes/app-routes/const';

export default function TabLayout() {
  const { replace } = useRouter();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { data: profile } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  const { language } = useAppSelector(({ settings }) => settings);
  const labels = LABELS[language];
  const { colors } = useTheme();
  const pathname = usePathname();
  const { status: trackingRecoveryStatus } = useAppSelector(({ trackingRecovery }) => trackingRecovery);
  const hideTabBar =
    pathname.includes(ROUTES.manualActivity) ||
    pathname.includes(ROUTES.changePassword) ||
    pathname === `/${ROUTES.activity}`;
  const isActivityRoute = pathname === `/${ROUTES.activity}` || pathname.endsWith(`/${ROUTES.activity}`);

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
  useEffect(() => {
    const isTracking = trackingRecoveryStatus === STATUSES.started || trackingRecoveryStatus === STATUSES.continued;

    if (isTracking && !isActivityRoute) {
      replace(`/${ROUTES.activity}`);
    }
  }, [isActivityRoute, replace, trackingRecoveryStatus]);

  if (Platform.OS === 'ios') {
    return (
      <NativeTabs
        hidden={hideTabBar}
        backgroundColor={colors.surface}
        iconColor={{ default: colors.secondary, selected: colors.primary }}
        labelStyle={{
          default: { color: 'transparent', fontSize: 0 },
          selected: { color: 'transparent', fontSize: 0 },
        }}
        blurEffect="systemMaterial"
        disableTransparentOnScrollEdge
        shadowColor={colors.outlineVariant}>
        <NativeTabs.Trigger
          name={HOME_TAB_ROUTE}
          accessibilityLabel={labels.feed}
          contentStyle={{ backgroundColor: colors.background }}>
          <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} />
          <NativeTabs.Trigger.Label hidden />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name={ROUTES.activity}
          accessibilityLabel={labels.activity}
          contentStyle={{ backgroundColor: colors.background }}>
          <NativeTabs.Trigger.Icon sf="figure.run" />
          <NativeTabs.Trigger.Label hidden />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name={ROUTES.statistic}
          accessibilityLabel={labels.statistics}
          contentStyle={{ backgroundColor: colors.background }}>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'chart.line.uptrend.xyaxis', selected: 'chart.line.uptrend.xyaxis' }}
          />
          <NativeTabs.Trigger.Label hidden />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name={ROUTES.profile}
          accessibilityLabel={labels.profile}
          contentStyle={{ backgroundColor: colors.background }}>
          <NativeTabs.Trigger.Icon sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }} />
          <NativeTabs.Trigger.Label hidden />
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        sceneStyle: { backgroundColor: colors.background },
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
          display: hideTabBar ? 'none' : 'flex',
        },
        tabBarItemStyle: { paddingVertical: 4 },
      }}>
      <Tabs.Screen
        name={HOME_TAB_ROUTE}
        options={{
          headerShown: false,
          tabBarAccessibilityLabel: labels.feed,
          tabBarIcon: ({ focused }) => renderTabIcon('home-outline', 'home-variant', focused),
        }}
      />
      <Tabs.Screen
        name={ROUTES.activity}
        options={{
          href: Platform.OS === 'web' ? null : undefined,
          tabBarAccessibilityLabel: labels.activity,
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            renderTabIcon('run-fast', 'run-fast', focused, focused ? colors.tertiary : colors.primary),
        }}
      />
      <Tabs.Screen
        name={ROUTES.statistic}
        options={{
          headerShown: false,
          tabBarAccessibilityLabel: labels.statistics,
          tabBarIcon: ({ focused }) => renderTabIcon('chart-line', 'chart-line', focused),
        }}
      />
      <Tabs.Screen
        name={ROUTES.profile}
        options={{
          tabBarAccessibilityLabel: labels.profile,
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
              <Suspense fallback={null}>
                <LazyAvatarShowable size={34} id={userId} focused={focused} profile={profile ?? undefined} />
              </Suspense>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
