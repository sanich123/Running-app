import { render } from '@testing-library/react-native';
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

describe('HealthConnectAutoSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseWorkoutImport.mockReturnValue({} as ReturnType<typeof useWorkoutImport>);
  });

  it('enables the global controller outside the manual import guide', async () => {
    mockUsePathname.mockReturnValue('/home');

    await render(<HealthConnectAutoSync />);

    expect(mockUseWorkoutImport).toHaveBeenCalledWith({ autoSync: true, enabled: true });
  });

  it('disables the global controller on the manual import guide', async () => {
    mockUsePathname.mockReturnValue('/watch-import/guide');

    await render(<HealthConnectAutoSync />);

    expect(mockUseWorkoutImport).toHaveBeenCalledWith({ autoSync: false, enabled: false });
  });
});
