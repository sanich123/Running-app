import { NetInfoCellularGeneration, NetInfoStateType } from '@react-native-community/netinfo';
import { createSlice } from '@reduxjs/toolkit';

export const NETWORK_INITIAL_STATE = {
  networkState: {
    details: {
      carrier: '',
      cellularGeneration: NetInfoCellularGeneration,
      isConnectionExpensive: false,
    },
    isConnected: false,
    isInternetReachable: false,
    isWifiEnabled: false,
    type: NetInfoStateType,
  },
};

export const network = createSlice({
  name: 'network',
  initialState: NETWORK_INITIAL_STATE,

  reducers: {
    changeNetworkState: (state, action) => {
      state.networkState = action.payload;
    },
  },
});

export const { changeNetworkState } = network.actions;
export default network.reducer;
