import { screen } from '@testing-library/react-native';

import ActivityCloseBtn from './activity-close-btn';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Activity-close-btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(<ActivityCloseBtn />);
    expect(screen.getByText(/close/i)).toBeDefined();
  });
});
