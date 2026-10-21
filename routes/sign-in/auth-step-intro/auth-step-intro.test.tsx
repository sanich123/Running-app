import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import { SignInPageStates } from '@U/validate-email-password';
import AuthStepIntro from './auth-step-intro';

describe('AuthStepIntro', () => {
  it('shows the introduction for the current authentication step', async () => {
    await renderWithProviders(<AuthStepIntro authStep={SignInPageStates.login} />);

    expect(screen.getByText('Тренируйся и общайся')).toBeOnTheScreen();
  });
});
