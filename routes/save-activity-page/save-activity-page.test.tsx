import { screen } from '@testing-library/react-native';
import { setCameraIsVisible, setIsManualAdding } from '@R/slices/manual-activity/manual-activity';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import SaveResult from './save-activity-page';

describe('save activity page', () => {
  beforeEach(() => {
    mockStore.dispatch(setCameraIsVisible(false));
    mockStore.dispatch(setIsManualAdding(false));
  });

  it('renders the activity editor controls', async () => {
    mockStore.dispatch(setIsManualAdding(true));
    await renderWithProviders(<SaveResult />);
    expect(screen.getByTestId('activity-title-input')).toBeOnTheScreen();
  });

  it('shows the camera instead of the editor when camera mode is enabled', async () => {
    mockStore.dispatch(setCameraIsVisible(true));
    await renderWithProviders(<SaveResult />);
    expect(screen.queryByTestId('activity-title-input')).not.toBeOnTheScreen();
  });
});
