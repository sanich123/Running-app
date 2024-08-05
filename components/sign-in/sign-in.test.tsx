import { changeLanguage } from '@R/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import SignIn from './sign-in';

describe('Sign in component', () => {
  it('should correctly renders', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<SignIn />, { store: mockStore });
    expect(screen.getByText(/already have an account?/i)).toBeDefined();
  });
});
