import { screen } from '@testing-library/react-native';

import LoginNavigation from './login-navigation';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Login navigation', () => {
  it('should correctly renders', () => {
    renderWithProviders(<LoginNavigation />, { store: mockStore });
    expect(screen.getByText('Forgot the password?')).toBeOnTheScreen();
    expect(screen.getByText('Reset')).toBeOnTheScreen();
  });
});
