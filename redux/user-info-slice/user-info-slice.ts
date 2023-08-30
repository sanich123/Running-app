import { createSlice } from '@reduxjs/toolkit';

export const userInfoSlice = createSlice({
  name: 'userInfoSlice',
  initialState: {
    email: '',
    id: '',
    login: '',
  },
  reducers: {
    getRegisterInfo: (state, action) => {
      const { id, email, login } = action.payload;
      state.email = email;
      state.id = id;
      state.login = login;
    },
  },
});

export const { getRegisterInfo } = userInfoSlice.actions;
export default userInfoSlice.reducer;
