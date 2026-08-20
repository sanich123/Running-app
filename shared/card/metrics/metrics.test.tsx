import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES, ROUTES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_DISTANCE, MOCK_DURATION } from '@T/mocks/mock-location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { getSpeedInMinsInKm } from '@U/location/location-utils';
import { formatDuration } from '@U/time-formatter';
import CardMetrics from './metrics';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  usePathname: () => 'some string',
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Card metrics', () => {
  it('should correctly renders', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(
      <CardMetrics
        title="some title"
        distance={MOCK_DISTANCE}
        duration={MOCK_DURATION}
        isShowDescription
        description="some description"
        userId="someUserId"
        id="someUUID"
      />,
      { store: mockStore },
    );
    ['pace', 'distance', 'time'].map((metric) => expect(screen.getByText(new RegExp(metric, 'i'))).toBeOnTheScreen());
    [getSpeedInMinsInKm(MOCK_DISTANCE, MOCK_DURATION).paceAsString, formatDuration(MOCK_DURATION)].map((metric) =>
      expect(screen.getByText(new RegExp(`${metric}`, 'i'))).toBeOnTheScreen(),
    );
    expect(screen.getByText('some description')).toBeOnTheScreen();
    expect(screen.queryByText('Description')).not.toBeOnTheScreen();
  });

  it('opens the full activity when the metrics are pressed', async () => {
    const user = userEvent.setup();
    await renderWithProviders(
      <CardMetrics
        title="some title"
        distance={MOCK_DISTANCE}
        duration={MOCK_DURATION}
        isShowDescription={false}
        description=""
        userId="someUserId"
        id="someUUID"
      />,
    );
    await user.press(screen.getByText('some title'));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.activity}/someUUID?userId=someUserId`);
  });
});
