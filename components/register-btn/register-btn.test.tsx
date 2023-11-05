import { screen } from '@testing-library/react-native';

import RegisterBtn from './register-btn';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Register btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(<RegisterBtn />, { store: mockStore });
    expect(screen.getByText('Register')).toBeOnTheScreen();
  });
});
