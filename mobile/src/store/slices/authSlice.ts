import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../services/apiService';

interface User {
  id: number;
  name: string;
  mobile: string;
  role: 'user' | 'admin' | 'driver';
  language: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  pendingMobile: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  otpSent: false,
  pendingMobile: null,
};

export const signup = createAsyncThunk(
  'auth/signup',
  async (data: { name: string; mobile: string; role?: string }, { rejectWithValue }) => {
    try {
      const res = await authService.signup(data.name, data.mobile, data.role);
      return res.data;
    } catch (err: any) {
      console.error('❌ Signup Error:', err);
      if (err.response) {
        console.error('Response Data:', err.response.data);
      } else if (err.request) {
        console.error('No response received. Network issue or IP mismatch.');
      }
      return rejectWithValue(err.response?.data?.error || 'Signup failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (mobile: string, { rejectWithValue }) => {
    try {
      const res = await authService.login(mobile);
      return { ...res.data, mobile };
    } catch (err: any) {
      console.error('❌ Login Error:', err);
      if (err.response) {
        console.error('Response Data:', err.response.data);
      } else if (err.request) {
        console.error('No response received. Network issue or IP mismatch.');
      }
      return rejectWithValue(err.response?.data?.error || 'Login failed');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (data: { mobile: string; otp: string }, { rejectWithValue }) => {
    try {
      const res = await authService.verifyOTP(data.mobile, data.otp);
      const { token, user } = res.data;
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      return { token, user };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'OTP verification failed');
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStored',
  async () => {
    const token = await AsyncStorage.getItem('auth_token');
    const userData = await AsyncStorage.getItem('user_data');
    if (token && userData) {
      return { token, user: JSON.parse(userData) };
    }
    return null;
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.removeItem('auth_token');
  await AsyncStorage.removeItem('user_data');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Signup
    builder.addCase(signup.pending, (state) => {
      state.isLoading = true; state.error = null;
    });
    builder.addCase(signup.fulfilled, (state, action) => {
      state.isLoading = false;
      state.otpSent = true;
      state.pendingMobile = action.meta.arg.mobile;
    });
    builder.addCase(signup.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true; state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.otpSent = true;
      state.pendingMobile = action.payload.mobile;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Verify OTP
    builder.addCase(verifyOTP.pending, (state) => {
      state.isLoading = true; state.error = null;
    });
    builder.addCase(verifyOTP.fulfilled, (state, action) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.otpSent = false;
      state.pendingMobile = null;
    });
    builder.addCase(verifyOTP.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Load Stored
    builder.addCase(loadStoredAuth.fulfilled, (state, action) => {
      if (action.payload) {
        state.token = action.payload.token;
        state.user = action.payload.user;
      }
    });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.otpSent = false;
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
