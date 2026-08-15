import { SignInPageStates, signInMap } from './validate-email-password';

describe('sign-in page navigation', () => {
  it('opens password reset from login', () => {
    expect(signInMap[SignInPageStates.login]).toBe(SignInPageStates.register);
  });

  it('opens login from registration', () => {
    expect(signInMap[SignInPageStates.register]).toBe(SignInPageStates.reset);
  });

  it('opens registration from password reset', () => {
    expect(signInMap[SignInPageStates.reset]).toBe(SignInPageStates.login);
  });
});
