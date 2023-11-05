import { screen } from '@testing-library/react-native';

import HomeActivityFullViewKmSplit from './home-activity-full-view-km-split';
import { MOCK_ACTIVITY } from '../../tests/mocks/mock-activity';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
import { formatDurationMinsSecs } from '../../utils/time-formatter';

describe('Home activity full view km split', () => {
  it('should correctly renders', () => {
    renderWithProviders(<HomeActivityFullViewKmSplit kilometresSplit={MOCK_ACTIVITY.kilometresSplit} />, {
      store: mockStore,
    });
    ['Splits', 'KM', 'PACE', 'ELEV'].map((item) => expect(screen.getByText(new RegExp(item, 'i'))).toBeOnTheScreen());
    MOCK_ACTIVITY.kilometresSplit.map(({ lastKilometerDuration }) => {
      expect(screen.getByText(`${formatDurationMinsSecs(lastKilometerDuration)}`)).toBeOnTheScreen();
    });
  });
});
