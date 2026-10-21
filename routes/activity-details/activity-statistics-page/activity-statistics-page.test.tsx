import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_ACTIVITY } from '@T/mocks/mock-activity';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityStatisticsPage from './activity-statistics-page';
import { ACTIVITY_STATISTICS_PAGE_COPY } from './const';

const mockUseActivityQuery = jest.fn();

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: () => ({ id: 'activity-1' }),
}));
jest.mock('@R/services/activity/activity', () => ({
  ...jest.requireActual('@R/services/activity/activity'),
  useGetActivityByActivityIdQuery: (...args: unknown[]) => mockUseActivityQuery(...args),
}));
jest.mock('@S/cross-platform-layout/cross-platform-layout', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: ({ children }: { children: React.ReactNode }) => <View>{children}</View> };
});
jest.mock('@S/error-component/error-component', () => {
  const { Pressable } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ refetch }: { refetch: () => void }) => (
      <Pressable testID="activity-statistics-retry" onPress={refetch} />
    ),
  };
});

describe('ActivityStatisticsPage', () => {
  const copy = ACTIVITY_STATISTICS_PAGE_COPY[LANGUAGES.english];

  beforeEach(() => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockStore.dispatch(setMockUserId('viewer-1'));
    mockUseActivityQuery.mockReset();
  });

  it('shows loading in preference to stale activity or error state', async () => {
    mockUseActivityQuery.mockReturnValue({ data: MOCK_ACTIVITY, error: { status: 'CUSTOM_ERROR' }, isLoading: true });

    await renderWithProviders(<ActivityStatisticsPage />, { store: mockStore });

    expect(screen.getByTestId('activity-statistics-loader')).toBeOnTheScreen();
    expect(screen.queryByText(copy.duration)).not.toBeOnTheScreen();
    expect(screen.queryByTestId('activity-statistics-retry')).not.toBeOnTheScreen();
  });

  it('shows the error state before cached activity content and retries on tap', async () => {
    const refetch = jest.fn();
    mockUseActivityQuery.mockReturnValue({ data: MOCK_ACTIVITY, error: { status: 'CUSTOM_ERROR' }, refetch });

    await renderWithProviders(<ActivityStatisticsPage />, { store: mockStore });
    fireEvent.press(screen.getByTestId('activity-statistics-retry'));

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(copy.duration)).not.toBeOnTheScreen();
  });

  it('renders the activity statistics and kilometer splits after loading', async () => {
    mockUseActivityQuery.mockReturnValue({ data: MOCK_ACTIVITY, isLoading: false });

    await renderWithProviders(<ActivityStatisticsPage />, { store: mockStore });

    expect(screen.getByText(copy.duration)).toBeOnTheScreen();
    expect(screen.getByText(copy.distance)).toBeOnTheScreen();
  });
});
