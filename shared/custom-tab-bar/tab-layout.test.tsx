import type { ReactNode } from 'react';
import { screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { ROUTES, STATUSES } from '@const/enums';
import { runichApi } from '@R/runich-api/runich-api';
import { setActivityStatus } from '@R/slices/location/location';
import { clearTrackingRecovery, startTrackingRecovery } from '@R/slices/tracking-recovery/tracking-recovery';
import { HOME_TAB_ROUTE } from '@Routes/app-routes/home-tab-route';
import { MOCK_SERVER_IDS, MOCK_SERVER_PROFILE } from '@T/responses/runich';
import { mockStore, resetMockLocation, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import TabLayout from '../../app/(tabs)/_layout';

const mockReplace = jest.fn();
let mockPathname = `/${ROUTES.home}`;
let mockTabsScreenOptions:
  | {
      sceneStyle?: unknown;
      tabBarStyle?: {
        backgroundColor?: unknown;
        borderTopColor?: unknown;
        height?: number;
        paddingBottom?: number;
        paddingTop?: number;
      };
      tabBarItemStyle?: unknown;
    }
  | undefined;
const mockTabIconStyles: { width?: number; height?: number; borderRadius?: number; backgroundColor?: unknown }[] = [];
const mockNativeTriggerContentStyles: unknown[] = [];
const mockNativeTriggerProps: { name?: string; disableAutomaticContentInsets?: boolean }[] = [];
const mockTabsScreenNames: string[] = [];
const mockNativeTriggerIconProps: { sf?: unknown; md?: unknown; selectedColor?: unknown }[] = [];
const mockWorkoutIconProps: { source?: unknown; color?: unknown; size?: number }[] = [];

jest.mock('expo-router', () => {
  const { View } = jest.requireActual('react-native');
  const Screen = ({
    name,
    options,
  }: {
    name?: string;
    options?: { tabBarIcon?: (props: { focused: boolean }) => ReactNode };
  }) => {
    if (name) mockTabsScreenNames.push(name);
    const focusedIcon = options?.tabBarIcon?.({ focused: true });
    const unfocusedIcon = options?.tabBarIcon?.({ focused: false });
    for (const icon of [focusedIcon, unfocusedIcon]) {
      if (icon && typeof icon === 'object' && 'props' in icon) {
        const iconProps = icon.props as { style?: (typeof mockTabIconStyles)[number]; children?: unknown };
        const { style } = iconProps;
        mockTabIconStyles.push(style ?? {});
        if (name === 'activity') {
          const { children } = iconProps;
          if (children && typeof children === 'object' && 'props' in children) {
            const childProps = children.props;
            if (childProps && typeof childProps === 'object' && 'source' in childProps) {
              mockWorkoutIconProps.push(childProps as (typeof mockWorkoutIconProps)[number]);
            }
          }
        }
      }
    }

    return (
      <View>
        {focusedIcon}
        {unfocusedIcon}
      </View>
    );
  };
  const Tabs = Object.assign(
    ({ children, screenOptions }: { children: ReactNode; screenOptions?: typeof mockTabsScreenOptions }) => {
      mockTabsScreenOptions = screenOptions;
      return <View>{children}</View>;
    },
    { Screen },
  );
  return {
    Tabs,
    usePathname: () => mockPathname,
    useRouter: () => ({ replace: mockReplace }),
  };
});

jest.mock('expo-router/native-tabs', () => {
  const { View } = jest.requireActual('react-native');
  const Trigger = ({
    children,
    contentStyle,
    name,
    disableAutomaticContentInsets,
  }: {
    children?: ReactNode;
    contentStyle?: unknown;
    name?: string;
    disableAutomaticContentInsets?: boolean;
  }) => {
    mockNativeTriggerProps.push({ name, disableAutomaticContentInsets });
    if (contentStyle) {
      mockNativeTriggerContentStyles.push(contentStyle);
    }
    return <View>{children}</View>;
  };
  Trigger.Icon = (props: { sf?: unknown; md?: unknown; selectedColor?: unknown }) => {
    mockNativeTriggerIconProps.push(props);
    return null;
  };
  Trigger.Label = () => null;
  const NativeTabs = Object.assign(({ children }: { children: ReactNode }) => <View>{children}</View>, { Trigger });
  return { NativeTabs };
});
jest.mock('@Routes/app-routes/const', () => {
  const { View } = jest.requireActual('react-native');
  return {
    LazyUserProfileAvatar: ({ profile }: { profile?: { profilePhoto?: string | null } }) => (
      <View testID="tab-avatar" accessibilityLabel={profile?.profilePhoto ?? ''} />
    ),
  };
});

describe('TabLayout', () => {
  beforeEach(() => {
    mockTabsScreenOptions = undefined;
    mockTabIconStyles.length = 0;
    mockNativeTriggerContentStyles.length = 0;
    mockNativeTriggerProps.length = 0;
    mockTabsScreenNames.length = 0;
    mockNativeTriggerIconProps.length = 0;
    mockWorkoutIconProps.length = 0;
    mockStore.dispatch(runichApi.util.resetApiState());
    mockStore.dispatch(setMockUserId(MOCK_SERVER_IDS.userId));
    mockStore.dispatch(resetMockLocation());
    mockStore.dispatch(clearTrackingRecovery());
  });

  it('opens the activity screen when tracking recovery is active on another route', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockPathname = `/${ROUTES.home}`;
    mockReplace.mockClear();
    mockStore.dispatch(startTrackingRecovery('tracking-journal'));
    await renderWithProviders(<TabLayout />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(`/${ROUTES.activity}`));
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('does not redirect while already on the activity screen', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockPathname = `/${ROUTES.activity}`;
    mockReplace.mockClear();
    mockStore.dispatch(startTrackingRecovery('tracking-journal'));
    await renderWithProviders(<TabLayout />);
    expect(mockReplace).not.toHaveBeenCalled();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('does not redirect based only on volatile activity status', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockPathname = `/${ROUTES.home}`;
    mockReplace.mockClear();
    mockStore.dispatch(setActivityStatus(STATUSES.started));

    await renderWithProviders(<TabLayout />);

    expect(mockReplace).not.toHaveBeenCalled();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('renders native tabs on iOS', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    mockPathname = `/${ROUTES.home}`;
    mockReplace.mockClear();
    mockStore.dispatch(resetMockLocation());

    const result = await renderWithProviders(<TabLayout />);

    expect(result.toJSON()).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockNativeTriggerProps.map(({ name }) => name).slice(-5)).toEqual([
      HOME_TAB_ROUTE,
      ROUTES.groups,
      ROUTES.activity,
      ROUTES.statistic,
      ROUTES.profile,
    ]);
    expect(mockNativeTriggerContentStyles.length).toBeGreaterThanOrEqual(4);
    expect(mockNativeTriggerContentStyles).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: expect.any(String) })]),
    );
    expect(mockNativeTriggerIconProps).toContainEqual(
      expect.objectContaining({
        sf: { default: 'record.circle', selected: 'record.circle.fill' },
        md: { default: 'radio_button_unchecked', selected: 'radio_button_checked' },
        selectedColor: expect.any(String),
      }),
    );
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('renders a compact project-styled Android tab bar with aligned highlighted icons', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockPathname = `/${ROUTES.home}`;
    mockReplace.mockClear();
    mockStore.dispatch(resetMockLocation());

    const result = await renderWithProviders(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 360, height: 640 },
          insets: { top: 24, right: 0, bottom: 24, left: 0 },
        }}>
        <TabLayout />
      </SafeAreaProvider>,
    );

    expect(result.toJSON()).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockNativeTriggerProps).toHaveLength(0);
    expect(mockTabsScreenOptions?.tabBarStyle).toEqual(
      expect.objectContaining({
        backgroundColor: expect.any(String),
        borderTopColor: expect.any(String),
        height: 88,
        paddingBottom: 30,
        paddingTop: 6,
      }),
    );
    expect(mockTabsScreenOptions?.tabBarItemStyle).toEqual({
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
    });
    expect(mockTabIconStyles[0]).toEqual(
      expect.objectContaining({ width: 52, height: 40, borderRadius: 20, backgroundColor: expect.any(String) }),
    );
    expect(mockTabIconStyles[1]).toEqual(
      expect.objectContaining({ width: 52, height: 40, borderRadius: 20, backgroundColor: 'transparent' }),
    );
    expect(mockTabIconStyles[2]).toEqual(
      expect.objectContaining({ width: 52, height: 40, borderRadius: 20, backgroundColor: expect.any(String) }),
    );
    expect(mockTabIconStyles[3]).toEqual(
      expect.objectContaining({ width: 52, height: 40, borderRadius: 20, backgroundColor: 'transparent' }),
    );
    expect(mockTabIconStyles[4]).toEqual(expect.objectContaining({ width: 60, height: 48, borderRadius: 24 }));
    expect(mockTabIconStyles[5]).toEqual(expect.objectContaining({ width: 60, height: 48, borderRadius: 24 }));
    expect(mockTabIconStyles[6]).toEqual(expect.objectContaining({ width: 52, height: 40, borderRadius: 20 }));
    expect(mockTabIconStyles[7]).toEqual(expect.objectContaining({ width: 52, height: 40, borderRadius: 20 }));
    expect(mockWorkoutIconProps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: 'record-circle-outline', color: expect.any(String), size: 36 }),
        expect.objectContaining({ source: 'record-circle', color: expect.any(String), size: 36 }),
      ]),
    );
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('renders the web tab configuration', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    mockPathname = `/${ROUTES.home}`;
    mockReplace.mockClear();
    mockStore.dispatch(resetMockLocation());

    const result = await renderWithProviders(<TabLayout />);

    expect(result.toJSON()).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockTabsScreenOptions?.sceneStyle).toEqual({ backgroundColor: expect.any(String) });
    expect(mockTabsScreenNames.slice(-5)).toEqual([
      HOME_TAB_ROUTE,
      ROUTES.groups,
      ROUTES.activity,
      ROUTES.statistic,
      ROUTES.profile,
    ]);
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it.each(['android', 'web'] as const)('uses the profile avatar in the %s tab bar', async (os) => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: os });

    await renderWithProviders(<TabLayout />);

    await waitFor(() =>
      expect(
        screen
          .getAllByTestId('tab-avatar')
          .some(({ props }) => props.accessibilityLabel === MOCK_SERVER_PROFILE.profilePhoto),
      ).toBe(true),
    );
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });
});
