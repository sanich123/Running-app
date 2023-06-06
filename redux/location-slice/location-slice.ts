import { createSlice } from '@reduxjs/toolkit';
import { Location } from '@rnmapbox/maps';

export const location = createSlice({
    name: 'location',
    initialState: {
        initialLocation: {} as Location,
    },
    reducers: {
        setInitialLocation: (state, action) => {
            state.initialLocation = action.payload;
        },
    },
});

export const { setInitialLocation } = location.actions;
export default location.reducer;