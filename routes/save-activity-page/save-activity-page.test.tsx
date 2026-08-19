import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import SaveResult from './save-activity-page';

let mockManualActivityParams = { mode: 'tracked', cameraVisible: 'false' };
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockManualActivityParams,
  useRouter: () => ({ replace: jest.fn(), setParams: jest.fn() }),
}));

describe('save activity page', () => {
  beforeEach(() => {
    mockManualActivityParams = { mode: 'tracked', cameraVisible: 'false' };
  });

  it('renders the activity editor controls', async () => {
    mockManualActivityParams = { mode: 'manual', cameraVisible: 'false' };
    await renderWithProviders(<SaveResult />);
    expect(screen.getByTestId('activity-title-input')).toBeOnTheScreen();
  });

  it('shows the camera instead of the editor when camera mode is enabled', async () => {
    mockManualActivityParams = { mode: 'manual', cameraVisible: 'true' };
    await renderWithProviders(<SaveResult />);
    expect(screen.queryByTestId('activity-title-input')).not.toBeOnTheScreen();
  });
});
