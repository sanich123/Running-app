import { Suspense, useEffect } from 'react';
import { NativeTabs } from 'expo-router/native-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View } from 'react-native';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { Icon, useTheme } from 'react-native-paper';
import { LABELS, ROUTES, STATUSES } from '@const/enums';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import { LazyUserProfileAvatar } from '@Routes/app-routes/const';
import { HOME_TAB_ROUTE } from '@Routes/app-routes/home-tab-route';

export default function TabLayout() {
  const { replace } = useRouter();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { data: profile } = useGetUserProfileByUserIdQuery(userId, { skip: !userId || Platform.OS === 'ios' });
  const { language } = useAppSelector(({ settings }) => settings);
  const labels = LABELS[language];
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { status: trackingRecoveryStatus } = useAppSelector(({ trackingRecovery }) => trackingRecovery);
  const hideTabBar =
    pathname.includes(ROUTES.manualActivity) ||
    pathname.includes(ROUTES.changePassword) ||
    pathname === `/${ROUTES.activity}`;
  const isActivityRoute = pathname === `/${ROUTES.activity}` || pathname.endsWith(`/${ROUTES.activity}`);
  const isRouteLibraryRoute = pathname === `/${ROUTES.routes}` || pathname === `/${ROUTES.addTrack}`;

  const renderTabIcon = (
    source: string,
    focusedSource: string,
    focused: boolean,
    options?: { color?: string; size?: number; highlighted?: boolean; testID?: string },
  ) => (
    <View
      testID={options?.testID}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: 52,
        height: options?.highlighted ? 48 : 40,
        borderRadius: options?.highlighted ? 24 : 20,
        backgroundColor: options?.highlighted ? 'transparent' : focused ? colors.primaryContainer : 'transparent',
      }}>
      <Icon
        source={focused ? focusedSource : source}
        color={options?.color ?? (focused ? colors.primary : colors.secondary)}
        size={options?.size ?? 30}
      />
    </View>
  );
  useEffect(() => {
    const isTracking = trackingRecoveryStatus === STATUSES.started || trackingRecoveryStatus === STATUSES.continued;

    if (isTracking && !isActivityRoute && !isRouteLibraryRoute) {
      replace(`/${ROUTES.activity}`);
    }
  }, [isActivityRoute, isRouteLibraryRoute, replace, trackingRecoveryStatus]);

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
          disableAutomaticContentInsets={false}
          contentStyle={{ backgroundColor: colors.background }}>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'house', selected: 'house.fill' }}
            md={{ default: 'home', selected: 'home_filled' }}
          />
          <NativeTabs.Trigger.Label hidden />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name={ROUTES.groups}
          accessibilityLabel={labels.groups}
          disableAutomaticContentInsets={false}
          contentStyle={{ backgroundColor: colors.background }}>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'person.3', selected: 'person.3.fill' }}
            md={{ default: 'groups', selected: 'groups' }}
          />
          <NativeTabs.Trigger.Label hidden />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name={ROUTES.activity}
          accessibilityLabel={labels.activity}
          disableAutomaticContentInsets={false}
          contentStyle={{ backgroundColor: colors.background }}>
          {/* NativeTabs fixes system symbols at 24pt; this SF Symbol image keeps Record at 36pt. */}
          <NativeTabs.Trigger.Icon
            src={require('../../assets/images/record-circle.png')}
            renderingMode="template"
            selectedColor={colors.error}
          />
          <NativeTabs.Trigger.Label hidden />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name={ROUTES.statistic}
          accessibilityLabel={labels.statistics}
          disableAutomaticContentInsets={false}
          contentStyle={{ backgroundColor: colors.background }}>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'chart.line.uptrend.xyaxis', selected: 'chart.line.uptrend.xyaxis' }}
            md={{ default: 'bar_chart', selected: 'monitoring' }}
          />
          <NativeTabs.Trigger.Label hidden />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name={ROUTES.profile}
          accessibilityLabel={labels.profile}
          disableAutomaticContentInsets={false}
          contentStyle={{ backgroundColor: colors.background }}>
          <NativeTabs.Trigger.Icon
            sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
            md={{ default: 'person_outline', selected: 'account_circle' }}
          />
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
          height: 64 + insets.bottom,
          paddingBottom: 6 + insets.bottom,
          paddingTop: 6,
          display: hideTabBar ? 'none' : 'flex',
        },
        tabBarItemStyle: { alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
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
        name={ROUTES.groups}
        options={{
          tabBarAccessibilityLabel: labels.groups,
          headerShown: false,
          title: labels.groups,
          tabBarIcon: ({ focused }) => renderTabIcon('account-group-outline', 'account-group', focused),
        }}
      />
      <Tabs.Screen
        name={ROUTES.activity}
        options={{
          href: Platform.OS === 'web' ? null : undefined,
          tabBarAccessibilityLabel: labels.activity,
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            renderTabIcon('record-circle-outline', 'record-circle', focused, {
              color: colors.error,
              highlighted: true,
              size: 38,
              testID: 'workout-record-tab-icon',
            }),
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
                <LazyUserProfileAvatar size={34} id={userId} focused={focused} profile={profile ?? undefined} />
              </Suspense>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
