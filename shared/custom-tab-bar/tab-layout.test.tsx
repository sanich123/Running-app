import type { ReactNode } from 'react';
import { waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { ROUTES, STATUSES } from '@const/enums';
import { setActivityStatus } from '@R/slices/location/location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import TabLayout from '../../app/(tabs)/_layout';

const mockReplace = jest.fn();
let mockPathname = `/${ROUTES.home}`;

jest.mock('expo-router', () => {
  const { View } = jest.requireActual('react-native');
  const Screen = () => null;
  const Tabs = Object.assign(({ children }: { children: ReactNode }) => <View>{children}</View>, { Screen });
  return {
    Tabs,
    usePathname: () => mockPathname,
    useRouter: () => ({ replace: mockReplace }),
  };
});

jest.mock('expo-router/unstable-native-tabs', () => {
  const { View } = jest.requireActual('react-native');
  const Trigger = () => null;
  Trigger.Icon = () => null;
  Trigger.Label = () => null;
  const NativeTabs = Object.assign(({ children }: { children: ReactNode }) => <View>{children}</View>, { Trigger });
  return { NativeTabs };
});

describe('TabLayout', () => {
  it('opens the activity screen when tracking is active on another route', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockPathname = `/${ROUTES.home}`;
    mockReplace.mockClear();
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    await renderWithProviders(<TabLayout />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(`/${ROUTES.activity}`));
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('does not redirect while already on the activity screen', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    mockPathname = `/${ROUTES.activity}`;
    mockReplace.mockClear();
    mockStore.dispatch(setActivityStatus(STATUSES.started));
    await renderWithProviders(<TabLayout />);
    expect(mockReplace).not.toHaveBeenCalled();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });
});
