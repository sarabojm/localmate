import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialToken = localStorage.getItem('localmate_token');
const initialUserJson = localStorage.getItem('localmate_user');
let parsedUser: User | null = null;
if (initialUserJson) {
  try {
    parsedUser = JSON.parse(initialUserJson);
  } catch {
    parsedUser = null;
  }
}

const initialState: AuthState = {
  user: parsedUser,
  token: initialToken,
  isAuthenticated: !!initialToken && !!parsedUser,
  isLoading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('localmate_token', action.payload.token);
      localStorage.setItem('localmate_user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('localmate_token');
      localStorage.removeItem('localmate_user');
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('localmate_user', JSON.stringify(state.user));
      }
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
