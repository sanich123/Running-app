export const enum SignInPageStates {
  register = 'register',
  login = 'login',
  reset = 'reset',
  emailLink = 'email-link',
}

export const signInMap = {
  [SignInPageStates.register]: SignInPageStates.login,
  [SignInPageStates.login]: SignInPageStates.reset,
  [SignInPageStates.reset]: SignInPageStates.register,
  [SignInPageStates.emailLink]: SignInPageStates.login,
};
