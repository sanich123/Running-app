import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_ACTIVITY } from '@T/mocks/mock-activity';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { formatDurationMinsSecs } from '@U/time-formatter';
import { KM_SPLITS } from './const';
import KmSplit from './km-split';
import { getFastestSplitDuration, getSplitBarWidth } from './utils';

describe('Home activity full view km split', () => {
  it('handles empty and zero-duration split calculations', () => {
    expect(getFastestSplitDuration([])).toBe(0);
    expect(getSplitBarWidth(MOCK_ACTIVITY.kilometresSplit[0], 0)).toBe(0);
    expect(getSplitBarWidth({ ...MOCK_ACTIVITY.kilometresSplit[0], lastKilometerDuration: 0 }, 100)).toBe(0);
    expect(getSplitBarWidth(MOCK_ACTIVITY.kilometresSplit[0], 100)).toBeGreaterThan(0);
  });

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

  it('keeps time and relative speed for walking splits', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    await renderWithProviders(
      <KmSplit
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

    expect(screen.getByText(KM_SPLITS.english.pace)).toBeOnTheScreen();
    expect(screen.getByText('01:00')).toBeOnTheScreen();
    expect(screen.queryByText(/CADENCE/)).not.toBeOnTheScreen();
  });
});
