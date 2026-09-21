import { screen, userEvent } from '@testing-library/react-native';
import { LANGUAGES, ROUTES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_DISTANCE, MOCK_DURATION } from '@T/mocks/mock-location';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { getSpeedInKmPerHour, getSpeedInMinsInKm } from '@U/location/location-utils';
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
        sport="run"
        elevationGain={42}
        isShowDescription
        description="some description"
        userId="someUserId"
        id="someUUID"
      />,
      { store: mockStore },
    );
    ['pace', 'distance', 'time', 'elevation gain'].map((metric) =>
      expect(screen.getByText(new RegExp(metric, 'i'))).toBeOnTheScreen(),
    );
    [getSpeedInMinsInKm(MOCK_DISTANCE, MOCK_DURATION).paceAsString, formatDuration(MOCK_DURATION)].map((metric) =>
      expect(screen.getByText(new RegExp(`${metric}`, 'i'))).toBeOnTheScreen(),
    );
    expect(screen.getByText('some title')).toHaveProp('numberOfLines', 2);
    expect(screen.getByText('some title')).toHaveProp('ellipsizeMode', 'tail');
    expect(screen.getByText('some description')).toHaveProp('numberOfLines', 4);
    expect(screen.getByText('some description')).toHaveProp('ellipsizeMode', 'tail');
    expect(screen.getByText('42 m')).toBeOnTheScreen();
    expect(screen.queryByText('Description')).not.toBeOnTheScreen();
  });

  it('shows kilometres per hour and total steps for walking', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(
      <CardMetrics
        title="walking"
        distance={MOCK_DISTANCE}
        duration={MOCK_DURATION}
        sport="walk"
        steps={1234}
        elevationGain={42}
        isShowDescription={false}
        description=""
        userId="someUserId"
        id="someUUID"
      />,
      { store: mockStore },
    );

    expect(screen.getByText(/Speed/i)).toBeOnTheScreen();
    expect(screen.getByText(/Steps/i)).toBeOnTheScreen();
    expect(screen.getByText(`${getSpeedInKmPerHour(MOCK_DISTANCE, MOCK_DURATION).toFixed(1)} km/h`)).toBeOnTheScreen();
    expect(screen.getByText('1234')).toBeOnTheScreen();
    expect(screen.queryByText(/Pace/i)).not.toBeOnTheScreen();
    expect(screen.queryByText(/Elevation gain/i)).not.toBeOnTheScreen();
  });

  it('shows calories only in the full activity view', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(
      <CardMetrics
        title="Бег"
        distance={MOCK_DISTANCE}
        duration={MOCK_DURATION}
        sport="run"
        caloriesActive={742}
        elevationGain={0}
        isShowDescription={false}
        description=""
        userId="someUserId"
        id="someUUID"
      />,
      { store: mockStore },
    );
    expect(screen.queryByText('742 ккал')).not.toBeOnTheScreen();

    await renderWithProviders(
      <CardMetrics
        title="Бег"
        distance={MOCK_DISTANCE}
        duration={MOCK_DURATION}
        sport="run"
        caloriesActive={742}
        elevationGain={0}
        isShowDescription={false}
        description=""
        userId="someUserId"
        id="someUUID"
        isFullView
      />,
      { store: mockStore },
    );
    expect(screen.getByText('742 ккал')).toBeOnTheScreen();
  });

  it.each([
    ['running without elevation gain', 'run', undefined, 0, /Elevation gain/i],
    ['walking without steps', 'walk', undefined, 42, /Steps/i],
    ['walking with zero steps', 'walk', 0, 42, /Steps/i],
  ])('hides the additional metric when there is %s', async (_caseName, sport, steps, elevationGain, metric) => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(
      <CardMetrics
        title={sport}
        distance={MOCK_DISTANCE}
        duration={MOCK_DURATION}
        sport={sport}
        steps={steps}
        elevationGain={elevationGain}
        isShowDescription={false}
        description=""
        userId="someUserId"
        id="someUUID"
      />,
      { store: mockStore },
    );

    expect(screen.queryByText(metric)).not.toBeOnTheScreen();
  });

  it.each(['hike', 'bike'])('keeps the existing three metrics for %s', async (sport) => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(
      <CardMetrics
        title={sport}
        distance={MOCK_DISTANCE}
        duration={MOCK_DURATION}
        sport={sport}
        isShowDescription={false}
        description=""
        userId="someUserId"
        id="someUUID"
        elevationGain={42}
      />,
      { store: mockStore },
    );

    expect(screen.getByText(/Speed/i)).toBeOnTheScreen();
    expect(screen.queryByText(/Elevation gain/i)).not.toBeOnTheScreen();
    expect(screen.queryByText(/Steps/i)).not.toBeOnTheScreen();
  });

  it('opens the full activity when the metrics are pressed', async () => {
    const user = userEvent.setup();
    await renderWithProviders(
      <CardMetrics
        title="some title"
        distance={MOCK_DISTANCE}
        duration={MOCK_DURATION}
        sport="run"
        elevationGain={0}
        isShowDescription={false}
        description=""
        userId="someUserId"
        id="someUUID"
      />,
    );
    await user.press(screen.getByText('some title'));
    expect(mockPush).toHaveBeenCalledWith(`/${ROUTES.activity}/someUUID?userId=someUserId`);
  });

  it('does not truncate the full activity description', async () => {
    await renderWithProviders(
      <CardMetrics
        title="some title"
        distance={MOCK_DISTANCE}
        duration={MOCK_DURATION}
        sport="run"
        elevationGain={0}
        isShowDescription
        description="some description"
        userId="someUserId"
        id="someUUID"
        isFullView
      />,
    );

    expect(screen.getByText('some title').props.numberOfLines).toBeUndefined();
    expect(screen.getByText('some description').props.numberOfLines).toBeUndefined();
  });
});
