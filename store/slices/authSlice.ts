import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";

interface AuthState {
  user: any | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  initialized: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Silent init on app mount
    checkAuth: (state) => { state.loading = true; },

    // Dispatched by login form — saga handles API + toast + redirect
    loginRequest: (state, _: PayloadAction<{ email: string; password: string }>) => {
      state.loading = true;
      state.error = null;
    },

    // Dispatched by register form — saga handles API + toast + redirect
    registerRequest: (state, _: PayloadAction<{ name: string; email: string; phone?: string; password: string }>) => {
      state.loading = true;
      state.error = null;
    },

    // Dispatched by logout button — saga handles API + toast + redirect
    logoutRequest: (state) => { state.loading = true; },

    setUser: (state, action: PayloadAction<any | null>) => {
      state.user = action.payload;
      state.loading = false;
      state.initialized = true;
      state.error = null;
    },

    authError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.initialized = true;
    },

    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.initialized = true;
    },
  },
});

export const selectUser            = (state: RootState) => state.auth.user;
export const selectAuthLoading     = (state: RootState) => state.auth.loading;
export const selectAuthInitialized = (state: RootState) => state.auth.initialized;

export const {
  checkAuth,
  loginRequest,
  registerRequest,
  logoutRequest,
  setUser,
  authError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
