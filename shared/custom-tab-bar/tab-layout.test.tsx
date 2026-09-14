import type { ReactNode } from 'react';
import { waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { ROUTES, STATUSES } from '@const/enums';
import { resetLocationSlice, setActivityStatus } from '@R/slices/location/location';
import { clearTrackingRecovery, startTrackingRecovery } from '@R/slices/tracking-recovery/tracking-recovery';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import TabLayout from '../../app/(tabs)/_layout';

const mockReplace = jest.fn();
let mockPathname = `/${ROUTES.home}`;
let mockTabsScreenOptions: { sceneStyle?: unknown } | undefined;
const mockNativeTriggerContentStyles: unknown[] = [];

jest.mock('expo-router', () => {
  const { View } = jest.requireActual('react-native');
  const Screen = ({ options }: { options?: { tabBarIcon?: (props: { focused: boolean }) => ReactNode } }) => (
    <View>
      {options?.tabBarIcon?.({ focused: true })}
      {options?.tabBarIcon?.({ focused: false })}
    </View>
  );
  const Tabs = Object.assign(
    ({ children, screenOptions }: { children: ReactNode; screenOptions?: { sceneStyle?: unknown } }) => {
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

jest.mock('expo-router/unstable-native-tabs', () => {
  const { View } = jest.requireActual('react-native');
  const Trigger = ({ children, contentStyle }: { children?: ReactNode; contentStyle?: unknown }) => {
    if (contentStyle) {
      mockNativeTriggerContentStyles.push(contentStyle);
    }
    return <View>{children}</View>;
  };
  Trigger.Icon = () => null;
  Trigger.Label = () => null;
  const NativeTabs = Object.assign(({ children }: { children: ReactNode }) => <View>{children}</View>, { Trigger });
  return { NativeTabs };
});
jest.mock('@Routes/app-routes/const', () => {
  const { View } = jest.requireActual('react-native');
  return { HOME_TAB_ROUTE: 'home', LazyAvatarShowable: () => <View testID="tab-avatar" /> };
});

describe('TabLayout', () => {
  beforeEach(() => {
    mockTabsScreenOptions = undefined;
    mockNativeTriggerContentStyles.length = 0;
    mockStore.dispatch(resetLocationSlice());
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
    mockStore.dispatch(resetLocationSlice());

    const result = await renderWithProviders(<TabLayout />);

    expect(result.toJSON()).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockNativeTriggerContentStyles).toHaveLength(4);
    expect(mockNativeTriggerContentStyles).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: expect.any(String) })]),
    );
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('renders the web tab configuration', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    mockPathname = `/${ROUTES.home}`;
    mockReplace.mockClear();
    mockStore.dispatch(resetLocationSlice());

    const result = await renderWithProviders(<TabLayout />);

    expect(result.toJSON()).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockTabsScreenOptions?.sceneStyle).toEqual({ backgroundColor: expect.any(String) });
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });
});
