import { screen } from '@testing-library/react-native';

import RegisterNavigation from './register-navigation';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Register navigation', () => {
  it('should correctly renders', () => {
    renderWithProviders(<RegisterNavigation />, { store: mockStore });
    expect(screen.getByText('Already have an account?')).toBeOnTheScreen();
    expect(screen.getByText('Login')).toBeOnTheScreen();
  });
});
