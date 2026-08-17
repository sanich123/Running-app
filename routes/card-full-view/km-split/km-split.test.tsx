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
});
