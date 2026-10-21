import { screen } from '@testing-library/react-native';
import { clearSubscriptionSnapshot, setSubscriptionSnapshot } from '@R/slices/subscription/subscription';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import SaveResult from './save-result';

let mockManualActivityParams = { mode: 'tracked', cameraVisible: 'false' };
jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: () => mockManualActivityParams,
  useRouter: () => ({ replace: jest.fn(), setParams: jest.fn() }),
}));
jest.mock('../date-picker/date-time-picker/date-time-picker', () => ({ __esModule: true, default: () => null }));
jest.mock('../date-picker-web/date-picker-web', () => ({ __esModule: true, default: () => null }));

describe('save activity page', () => {
  beforeEach(() => {
    mockManualActivityParams = { mode: 'tracked', cameraVisible: 'false' };
    mockStore.dispatch(clearSubscriptionSnapshot());
    mockStore.dispatch(setMockUserId('save-page-user'));
  });

  it('renders the activity editor controls', async () => {
    mockManualActivityParams = { mode: 'manual', cameraVisible: 'false' };
    await renderWithProviders(<SaveResult />);
    expect(screen.getByTestId('activity-title-input')).toBeOnTheScreen();
  });

  it('keeps the editor visible when the camera mode parameter is enabled', async () => {
    mockManualActivityParams = { mode: 'manual', cameraVisible: 'true' };
    await renderWithProviders(<SaveResult />);
    expect(screen.getByTestId('activity-title-input')).toBeOnTheScreen();
  });

  it('shows the media picker without a subscription', async () => {
    await renderWithProviders(<SaveResult />);

    expect(screen.queryByText('Фото и видео доступны по подписке Runich Plus')).not.toBeOnTheScreen();
    expect(screen.getByTestId('upload-gallery-button')).toBeOnTheScreen();
  });

  it('shows the media picker for an active subscription', async () => {
    mockStore.dispatch(
      setSubscriptionSnapshot({
        userId: 'save-page-user',
        isPremium: true,
        status: 'active',
        provider: 'manual',
        productId: 'annual',
        startsAt: '2026-01-01T00:00:00.000Z',
        expiresAt: '2099-01-01T00:00:00.000Z',
        cancelAtPeriodEnd: false,
      }),
    );

    await renderWithProviders(<SaveResult />);

    expect(screen.getByTestId('upload-gallery-button')).toBeOnTheScreen();
    expect(screen.queryByText('Фото и видео доступны по подписке Runich Plus')).not.toBeOnTheScreen();
  });
});
