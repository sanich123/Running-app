export const enum SignInPageStates {
  register = 'register',
  login = 'login',
  reset = 'reset',
}

export const signInMap = {
  [SignInPageStates.register]: SignInPageStates.login,
  [SignInPageStates.login]: SignInPageStates.register,
  [SignInPageStates.reset]: SignInPageStates.register,
};
