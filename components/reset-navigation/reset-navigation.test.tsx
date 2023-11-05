import { screen } from '@testing-library/react-native';

import ResetNavigation from './reset-navigation';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Reset navigation', () => {
  it('should correctly renders', () => {
    renderWithProviders(<ResetNavigation />, { store: mockStore });
    expect(screen.getByText("Don't have an account?")).toBeOnTheScreen();
    expect(screen.getByText('Register')).toBeOnTheScreen();
  });
});
