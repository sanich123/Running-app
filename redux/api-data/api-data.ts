import { createSlice } from '@reduxjs/toolkit';

export const apiData = createSlice({
  name: 'apiData',
  initialState: {
    savedUrlAddress: '',
    dataDoc: '',
    responseData: '',
    requestData: 'some string',
    variablesData: '',
  },
  reducers: {
    setUrlAddress: (state, action) => {
      state.savedUrlAddress = action.payload;
    },
    changeDataSchema: (state, action) => {
      state.dataDoc = action.payload;
    },
    saveRequest: (state, action) => {
      state.requestData = action.payload;
    },
    saveResponse: (state, action) => {
      state.responseData = JSON.stringify(action.payload);
    },
    saveVariables: (state, action) => {
      state.variablesData = action.payload;
    },
  },
});

export const { setUrlAddress, changeDataSchema, saveRequest, saveResponse, saveVariables } = apiData.actions;
export default apiData.reducer;
