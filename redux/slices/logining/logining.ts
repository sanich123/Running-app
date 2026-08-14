import { createSlice } from '@reduxjs/toolkit';
const logining = createSlice({
  name: 'logining',
  initialState: { email: '', password: '', isDisabledWhenLogining: false },
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
  },
});

export const { saveEmail, savePassword, setIsDisabledWhenLogining } = logining.actions;

export default logining.reducer;
