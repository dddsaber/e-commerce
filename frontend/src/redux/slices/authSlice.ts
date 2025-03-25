/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  login,
  logout,
  reAuth,
  register,
  loginGithub,
  loginGoogle,
  loginFacebook,
} from "../../api/auth.api";
import { User } from "../../type/user.type";
import dayjs from "dayjs";

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user:
    | User
    | {
        _id: string;
        role: string;
        avatar?: string;
        name?: string;
        phone?: string;
        email?: string;
        username?: string;
        description?: string;
        birthday?: dayjs.Dayjs;
        gender?: boolean;
        address?: {
          province: string;
          district: string;
          ward: string;
          details?: string;
        };
      };
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: {
    _id: "",
    role: "",
  },
  isAuthenticated: false,
  loading: true,
};

export const loginAuth = createAsyncThunk(
  "login",
  async (body: { identifier: string; password: string }, thunkAPI) => {
    try {
      const response = await login(body);
      return response.data as AuthResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || error?.message
      );
    }
  }
);

export const loginGithubAuth = createAsyncThunk(
  "loginGithub",
  async (body: {}, thunkAPI) => {
    try {
      const response = await loginGithub();
      return response.data as AuthResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || error?.message
      );
    }
  }
);

export const loginGoogleAuth = createAsyncThunk(
  "loginGoogle",
  async (body: { token: string }, thunkAPI) => {
    try {
      const response = await loginGoogle(body.token);
      return response.data as AuthResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || error?.message
      );
    }
  }
);

export const loginFacebookAuth = createAsyncThunk(
  "loginFacebook",
  async (body: {}, thunkAPI) => {
    try {
      const response = await loginFacebook();
      return response.data as AuthResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || error?.message
      );
    }
  }
);

export const reloginAuth = createAsyncThunk(
  "reauth",
  async (body: { refreshToken: string }, thunkAPI) => {
    try {
      const response = await reAuth(body);
      return response.data as AuthResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || error?.message
      );
    }
  }
);

export const registerAuth = createAsyncThunk(
  "register",
  async (body: { phone: string; password: string; name: string }, thunkAPI) => {
    try {
      const response = await register(body);
      return response.data as AuthResponse;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || error?.message
      );
    }
  }
);

export const logoutAuth = createAsyncThunk(
  "logout",
  async (userId: string, thunkAPI) => {
    try {
      await logout(userId);
      return userId;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || error?.message
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        registerAuth.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.loading = false;
          localStorage.setItem("accessToken", action.payload.accessToken);
          localStorage.setItem("refreshToken", action.payload.refreshToken);
        }
      )
      .addCase(
        loginAuth.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.loading = false;
          localStorage.setItem("accessToken", action.payload.accessToken);
          localStorage.setItem("refreshToken", action.payload.refreshToken);
        }
      )
      .addCase(
        reloginAuth.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.loading = false;
          localStorage.setItem("accessToken", action.payload.accessToken);
        }
      )
      .addCase(registerAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(reloginAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerAuth.rejected, (state) => {
        state.loading = false;
      })
      .addCase(reloginAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = {
          _id: "",
          role: "",
        };
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      })
      .addCase(loginAuth.rejected, (state) => {
        state.loading = false;
      })
      .addCase(logoutAuth.fulfilled, (state) => {
        state.user = {
          _id: "",
          role: "",
        };
        state.isAuthenticated = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      })
      .addCase(logoutAuth.rejected, (state, action: PayloadAction<any>) => {
        console.error("Logout failed:", action.payload);
      })
      .addCase(
        loginGithubAuth.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.loading = false;
          localStorage.setItem("accessToken", action.payload.accessToken);
          localStorage.setItem("refreshToken", action.payload.refreshToken);
        }
      )
      .addCase(loginGithubAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginGithubAuth.rejected, (state) => {
        state.loading = false;
      })
      .addCase(
        loginGoogleAuth.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.loading = false;
          localStorage.setItem("accessToken", action.payload.accessToken);
          localStorage.setItem("refreshToken", action.payload.refreshToken);
        }
      )
      .addCase(loginGoogleAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginGoogleAuth.rejected, (state) => {
        state.loading = false;
      })
      .addCase(
        loginFacebookAuth.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.loading = false;
          localStorage.setItem("accessToken", action.payload.accessToken);
          localStorage.setItem("refreshToken", action.payload.refreshToken);
        }
      )
      .addCase(loginFacebookAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginFacebookAuth.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default authSlice.reducer;
