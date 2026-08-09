import { createSlice } from '@reduxjs/toolkit';
import { SignInPageStates } from '@U/validate-email-password';

const logining = createSlice({
  name: 'logining',
  initialState: { email: '', password: '', isDisabledWhenLogining: false, pageState: SignInPageStates.login },
  reducers: {
    saveEmail: (state, { payload }) => {
      state.email = payload;
    },
    savePassword: (state, { payload }) => {
      state.password = payload;
    },
    setIsDisabledWhenLogining: (state, { payload }) => {
      state.isDisabledWhenLogining = payload;
    },
    setSignInPageState: (state, { payload }) => {
      state.pageState = payload;
    },
  },
});

export const { saveEmail, savePassword, setIsDisabledWhenLogining, setSignInPageState } = logining.actions;

export default logining.reducer;
