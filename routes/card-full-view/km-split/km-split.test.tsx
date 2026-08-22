import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_ACTIVITY } from '@T/mocks/mock-activity';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { formatDurationMinsSecs } from '@U/time-formatter';
import { KM_SPLITS } from './const';
import KmSplit from './km-split';

describe('Home activity full view km split', () => {
  it('should correctly renders in english', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(<KmSplit kilometresSplit={MOCK_ACTIVITY.kilometresSplit} />, {
      store: mockStore,
    });
    [KM_SPLITS.english.splits, KM_SPLITS.english.km, KM_SPLITS.english.pace, KM_SPLITS.english.elev].map((item) =>
      expect(screen.getByText(new RegExp(item))).toBeOnTheScreen(),
    );
    MOCK_ACTIVITY.kilometresSplit.map(({ lastKilometerDuration }) => {
      expect(screen.getByText(`${formatDurationMinsSecs(lastKilometerDuration)}`)).toBeOnTheScreen();
      expect(screen.getByText(`${formatDurationMinsSecs(lastKilometerDuration)}`)).toHaveProp('numberOfLines', 1);
    });
    expect(screen.getByText('3.3')).toBeOnTheScreen();
    expect(screen.getByText('17.5')).toBeOnTheScreen();
  });
  it('should correctly renders in russian', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<KmSplit kilometresSplit={MOCK_ACTIVITY.kilometresSplit} />, {
      store: mockStore,
    });
    [KM_SPLITS.russian.splits, KM_SPLITS.russian.km, KM_SPLITS.russian.pace, KM_SPLITS.russian.elev].map((item) =>
      expect(screen.getByText(new RegExp(item))).toBeOnTheScreen(),
    );
    MOCK_ACTIVITY.kilometresSplit.map(({ lastKilometerDuration }) => {
      expect(screen.getByText(`${formatDurationMinsSecs(lastKilometerDuration)}`)).toBeOnTheScreen();
    });
  });

  it('shows cadence for walking splits', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(
      <KmSplit
        sport="walk"
        kilometresSplit={[
          {
            kilometerPoint: MOCK_ACTIVITY.kilometresSplit[0].kilometerPoint,
            lastKilometerAltitude: 0,
            lastKilometerDuration: 60_000,
            lastKilometerSteps: 120,
          },
        ]}
      />,
      { store: mockStore },
    );

    expect(screen.getByText(KM_SPLITS.english.cadence)).toBeOnTheScreen();
    expect(screen.getByText('120 spm')).toBeOnTheScreen();
  });

  it('shows cycling speed in kilometres per hour', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(
      <KmSplit
        sport="bike"
        kilometresSplit={[
          {
            kilometerPoint: MOCK_ACTIVITY.kilometresSplit[0].kilometerPoint,
            lastKilometerAltitude: 0,
            lastKilometerDuration: 60_000,
          },
        ]}
      />,
      { store: mockStore },
    );

    expect(screen.getByText(KM_SPLITS.english.speed)).toBeOnTheScreen();
    expect(screen.getByText('60.0 km/h')).toBeOnTheScreen();
  });

  it('shows hiking speed in kilometres per hour', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(
      <KmSplit
        sport="hike"
        kilometresSplit={[
          {
            kilometerPoint: MOCK_ACTIVITY.kilometresSplit[0].kilometerPoint,
            lastKilometerAltitude: 0,
            lastKilometerDuration: 60_000,
          },
        ]}
      />,
      { store: mockStore },
    );

    expect(screen.getByText(KM_SPLITS.english.speed)).toBeOnTheScreen();
    expect(screen.getByText('60.0 km/h')).toBeOnTheScreen();
  });
});
