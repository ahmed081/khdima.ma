import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";

interface AuthState {
    user: any | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        checkAuth: (state) => {
            state.loading = true;
        },
        setUser: (state, action: PayloadAction<any | null>) => {
            state.user = action.payload;
            state.loading = false;
        },
        authError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        logout: (state) => {
            state.user = null;
        },
    },
});


export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.loading;

export const { checkAuth, setUser, authError, logout } = authSlice.actions;
export default authSlice.reducer;
