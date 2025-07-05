import { changeLanguage } from '@R/slices/language/language';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';
import CardMetrics from './metrics';
import { MOCK_DISTANCE, MOCK_DURATION } from '@T/mocks/mock-location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { getSpeedInMinsInKm } from '@U/location/location-utils';
import { formatDuration } from '@U/time-formatter';


jest.mock('expo-router', () => ({
  usePathname: () => 'some string',
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Card metrics', () => {
  it('should correctly renders', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(
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
  });
});
