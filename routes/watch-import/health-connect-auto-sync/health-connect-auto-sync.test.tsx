import { render } from '@testing-library/react-native';
import { Platform } from 'react-native';
import type * as ExpoRouterModule from 'expo-router';
import type * as AutoSyncModule from './health-connect-auto-sync';
import type * as WorkoutImportModule from '../workout-import/use-workout-import';

jest.mock('expo-router', () => ({ usePathname: jest.fn() }));
jest.mock('../workout-import/use-workout-import', () => ({ useWorkoutImport: jest.fn() }));

const { usePathname } = require('expo-router') as typeof ExpoRouterModule;
const HealthConnectAutoSync = require('./health-connect-auto-sync').default as typeof AutoSyncModule.default;
const { useWorkoutImport } = require('../workout-import/use-workout-import') as typeof WorkoutImportModule;

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseWorkoutImport = useWorkoutImport as jest.MockedFunction<typeof useWorkoutImport>;
const originalPlatformOS = Platform.OS;

function setPlatformOS(platform: 'android' | 'web') {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: platform });
}

describe('HealthConnectAutoSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseWorkoutImport.mockReturnValue({} as ReturnType<typeof useWorkoutImport>);
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatformOS });
  });

  it('enables the global controller outside the manual import guide', async () => {
    setPlatformOS('android');
    mockUsePathname.mockReturnValue('/home');

    await render(<HealthConnectAutoSync />);

    expect(mockUseWorkoutImport).toHaveBeenCalledWith({ autoSync: true, enabled: true });
  });

  it('disables the global controller on the workout import page', async () => {
    setPlatformOS('android');
    mockUsePathname.mockReturnValue('/watch-import');

    await render(<HealthConnectAutoSync />);

    expect(mockUseWorkoutImport).toHaveBeenCalledWith({ autoSync: false, enabled: false });
  });

  it('disables the native controller on web', async () => {
    setPlatformOS('web');
    mockUsePathname.mockReturnValue('/home');

    await render(<HealthConnectAutoSync />);

    expect(mockUseWorkoutImport).toHaveBeenCalledWith({ autoSync: false, enabled: false });
  });
});
