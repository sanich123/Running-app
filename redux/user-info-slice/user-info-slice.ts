import { createSlice } from '@reduxjs/toolkit';

export const userInfoSlice = createSlice({
  name: 'userInfoSlice',
  initialState: {
    email: '',
    id: '',
    login: '',
    settings: {
      gender: '',
      sport: '',
      name: '',
      surname: '',
      city: '',
      weight: '',
      bio: '',
      birthday: '',
      profilePhoto: '',
    },
  },
  reducers: {
    getRegisterInfo: (state, action) => {
      const { id, email, login } = action.payload;
      state.email = email;
      state.id = id;
      state.login = login;
    },
    saveSettingsInfo: (state, action) => {
      state.settings = action.payload;
    },
  },
});

export const { getRegisterInfo, saveSettingsInfo } = userInfoSlice.actions;
export default userInfoSlice.reducer;
