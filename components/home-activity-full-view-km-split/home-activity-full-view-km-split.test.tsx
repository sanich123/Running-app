import { screen } from '@testing-library/react-native';

import { KM_SPLITS } from './const';
import HomeActivityFullViewKmSplit from './home-activity-full-view-km-split';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { MOCK_ACTIVITY } from '../../tests/mocks/mock-activity';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
import { formatDurationMinsSecs } from '../../utils/time-formatter';

describe('Home activity full view km split', () => {
  it('should correctly renders in english', () => {
    renderWithProviders(<HomeActivityFullViewKmSplit kilometresSplit={MOCK_ACTIVITY.kilometresSplit} />, {
      store: mockStore,
    });
    [KM_SPLITS.english.splits, KM_SPLITS.english.km, KM_SPLITS.english.pace, KM_SPLITS.english.elev].map((item) =>
      expect(screen.getByText(new RegExp(item))).toBeOnTheScreen(),
    );
    MOCK_ACTIVITY.kilometresSplit.map(({ lastKilometerDuration }) => {
      expect(screen.getByText(`${formatDurationMinsSecs(lastKilometerDuration)}`)).toBeOnTheScreen();
    });
  });
  it('should correctly renders in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<HomeActivityFullViewKmSplit kilometresSplit={MOCK_ACTIVITY.kilometresSplit} />, {
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
