import { screen } from '@testing-library/react-native';

import ActivityErrorMsg from './activity-error-msg';
import { ACTIVITY } from '../../constants/texts/activity';
import { setIsAppShuted } from '../../redux/location/location';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Activity-error-msg', () => {
  it('should correctly render error message', async () => {
    mockStore.dispatch(setIsAppShuted(true));
    await renderWithProviders(<ActivityErrorMsg />, { store: mockStore });
    expect(screen.getByText(ACTIVITY.english.ERROR_MSG)).toBeDefined();
  });
});
