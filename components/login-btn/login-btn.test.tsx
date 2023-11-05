import { screen } from '@testing-library/react-native';

import LoginBtn from './login-btn';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Login btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(<LoginBtn />, { store: mockStore });
    expect(screen.getByText('Login')).toBeOnTheScreen();
  });
});
