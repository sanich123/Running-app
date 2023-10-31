import { screen } from '@testing-library/react-native';

import ActivityErrorMsg from './activity-error-msg';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Activity-error-msg', () => {
  it('should correctly renders', () => {
    renderWithProviders(<ActivityErrorMsg />);
    screen.debug();
  });
});
