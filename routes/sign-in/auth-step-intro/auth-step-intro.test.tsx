import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import { SignInPageStates } from '@U/validate-email-password';
import AuthStepIntro from './auth-step-intro';
import { AUTH_STEP_INTRO_CONTENT } from '../const';

describe('AuthStepIntro', () => {
  it('shows the introduction for the current authentication step', async () => {
    await renderWithProviders(<AuthStepIntro authStep={SignInPageStates.login} />);

    expect(screen.getByText(AUTH_STEP_INTRO_CONTENT.russian.login.title)).toBeOnTheScreen();
  });
});
