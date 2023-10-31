import { screen } from '@testing-library/react-native';

import Checkbox from './checkbox';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Checkbox', () => {
  it('should correctly renders', async () => {
    renderWithProviders(<Checkbox />);
    expect(screen.getByText(/Don't publish on Home or Club feeds/i)).toBeDefined();
    const switcher = screen.getByTestId(/switcher/i);
    expect(switcher).toBeDefined();
  });
});
