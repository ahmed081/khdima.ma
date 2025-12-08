import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AppState {
    globalError: string | null;
    isUnauthorized: boolean;
}

const initialState: AppState = {
    globalError: null,
    isUnauthorized: false,
};

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        setGlobalError: (state, action: PayloadAction<string | null>) => {
            state.globalError = action.payload;
        },
        unauthorized: (state) => {
            state.isUnauthorized = true;
        },
    },
});

export const { setGlobalError, unauthorized } = appSlice.actions;
export default appSlice.reducer;
