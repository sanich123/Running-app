export const enum SignInPageStates {
  register = 'register',
  login = 'login',
  reset = 'reset',
  emailLink = 'email-link',
}

export const signInMap = {
  [SignInPageStates.login]: SignInPageStates.register,
  [SignInPageStates.register]: SignInPageStates.reset,
  [SignInPageStates.reset]: SignInPageStates.login,
  [SignInPageStates.emailLink]: SignInPageStates.login,
};
