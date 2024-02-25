import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen } from '@testing-library/react-native';

import SignIn from './sign-in';

describe('Sign in component', () => {
  it('should correctly renders', () => {
    renderWithProviders(<SignIn />, { store: mockStore });
    screen.debug();
  });
});
