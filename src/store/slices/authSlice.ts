import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '../../api/client';
import { authEndpoints } from '../../api/endpoints/auth';

export type AuthUser = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  address_line_1?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  created_at?: string | null;
  last_login_at?: string | null;
  phone?: string | null;
};

type LoginSuccessData = {
  user: AuthUser;
  token: string;
};

type ForgotPasswordSuccessData = {
  message?: string;
};

type VerifyResetOtpSuccessData = {
  reset_token: string;
  expires_at: string;
};

type ResetPasswordSuccessData = {
  message?: string;
};

type RegisterSuccessData = {
  user: AuthUser;
};

type SendEmailOtpSuccessData = {
  message?: string;
  expires_at?: string;
};

type VerifyEmailOtpSuccessData = {
  message?: string;
};

type SendPhoneOtpSuccessData = {
  message?: string;
  expires_at?: string;
};

type VerifyPhoneOtpSuccessData = {
  message?: string;
};

type UpdateProfileSuccessData = {
  user?: AuthUser;
  message?: string;
} & Partial<AuthUser>;

export const updateProfileHomeowner = createAsyncThunk<
  UpdateProfileSuccessData,
  {
    user_id: number;
    first_name: string;
    last_name: string;
    address_line_1?: string;
    city?: string;
    state?: string;
    zip?: string;
  },
  { rejectValue: string; state: { auth: AuthState } }
>('auth/updateProfileHomeowner', async (payload, thunkApi) => {
  try {
    const token = thunkApi.getState().auth.accessToken;

    const response = await apiRequest<UpdateProfileSuccessData>({
      method: 'POST',
      path: authEndpoints.updateProfile(),
      token,
      body: payload,
    });

    if (!response.success) {
      return thunkApi.rejectWithValue(response.message ?? 'Failed to update profile');
    }

    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return thunkApi.rejectWithValue(message);
  }
});

export const loginHomeowner = createAsyncThunk<
  LoginSuccessData,
  { email: string; password: string },
  { rejectValue: string }
>('auth/loginHomeowner', async (payload, thunkApi) => {
  try {
    const response = await apiRequest<LoginSuccessData>({
      method: 'POST',
      path: authEndpoints.login(),
      body: {
        email: payload.email,
        password: payload.password,
      },
    });

    if (!response.success) {
      return thunkApi.rejectWithValue(response.message ?? 'Login failed');
    }

    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return thunkApi.rejectWithValue(message);
  }
});

export const forgotPasswordHomeowner = createAsyncThunk<
  ForgotPasswordSuccessData,
  { email: string },
  { rejectValue: string }
>('auth/forgotPasswordHomeowner', async (payload, thunkApi) => {
  try {
    const response = await apiRequest<ForgotPasswordSuccessData>({
      method: 'POST',
      path: authEndpoints.forgotPassword(),
      body: {
        email: payload.email,
      },
    });

    if (!response.success) {
      return thunkApi.rejectWithValue(response.message ?? 'Failed to send OTP');
    }

    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send OTP';
    return thunkApi.rejectWithValue(message);
  }
});

export const verifyResetOtpHomeowner = createAsyncThunk<
  VerifyResetOtpSuccessData,
  { email: string; otp: string },
  { rejectValue: string }
>('auth/verifyResetOtpHomeowner', async (payload, thunkApi) => {
  try {
    const response = await apiRequest<{ success: true; data: VerifyResetOtpSuccessData } | VerifyResetOtpSuccessData>({
      method: 'POST',
      path: authEndpoints.verifyResetOtp(),
      body: {
        email: payload.email,
        otp: payload.otp,
      },
    });

    if (!response.success) {
      return thunkApi.rejectWithValue(response.message ?? 'Failed to verify OTP');
    }

    // apiRequest returns ApiResponse<T>; our backend wraps data under `data`
    const raw = response.data as any;
    const data: VerifyResetOtpSuccessData = raw?.reset_token ? raw : raw?.data;

    if (!data?.reset_token) {
      return thunkApi.rejectWithValue('Invalid server response');
    }

    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to verify OTP';
    return thunkApi.rejectWithValue(message);
  }
});

export const resetPasswordHomeowner = createAsyncThunk<
  ResetPasswordSuccessData,
  { reset_token: string; new_password: string; new_password_confirmation: string },
  { rejectValue: string }
>('auth/resetPasswordHomeowner', async (payload, thunkApi) => {
  try {
    const response = await apiRequest<ResetPasswordSuccessData>({
      method: 'POST',
      path: authEndpoints.resetPassword(),
      body: payload,
    });

    if (!response.success) {
      return thunkApi.rejectWithValue(response.message ?? 'Failed to reset password');
    }

    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reset password';
    return thunkApi.rejectWithValue(message);
  }
});

export const registerHomeowner = createAsyncThunk<
  RegisterSuccessData,
  {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirmation: string;
    address_line_1?: string;
    city?: string;
    state?: string;
    zip?: string;
  },
  { rejectValue: string }
>('auth/registerHomeowner', async (payload, thunkApi) => {
  try {
    const response = await apiRequest<RegisterSuccessData>({
      method: 'POST',
      path: authEndpoints.register(),
      body: payload,
    });

    if (!response.success) {
      return thunkApi.rejectWithValue(response.message ?? 'Registration failed');
    }

    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return thunkApi.rejectWithValue(message);
  }
});

export const sendEmailOtpHomeowner = createAsyncThunk<
  SendEmailOtpSuccessData,
  { email: string },
  { rejectValue: string }
>('auth/sendEmailOtpHomeowner', async (payload, thunkApi) => {
  try {
    const response = await apiRequest<SendEmailOtpSuccessData>({
      method: 'POST',
      path: authEndpoints.sendEmailOtp(),
      body: {
        email: payload.email,
      },
    });

    if (!response.success) {
      return thunkApi.rejectWithValue(response.message ?? 'Failed to send email OTP');
    }

    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email OTP';
    return thunkApi.rejectWithValue(message);
  }
});

export const verifyEmailOtpHomeowner = createAsyncThunk<
  VerifyEmailOtpSuccessData,
  { email: string; otp: string },
  { rejectValue: string }
>('auth/verifyEmailOtpHomeowner', async (payload, thunkApi) => {
  try {
    const response = await apiRequest<VerifyEmailOtpSuccessData>({
      method: 'POST',
      path: authEndpoints.verifyEmailOtp(),
      body: {
        email: payload.email,
        otp: payload.otp,
      },
    });

    if (!response.success) {
      return thunkApi.rejectWithValue(response.message ?? 'Failed to verify email OTP');
    }

    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to verify email OTP';
    return thunkApi.rejectWithValue(message);
  }
});

export const sendPhoneOtpHomeowner = createAsyncThunk<
  SendPhoneOtpSuccessData,
  { phone: string },
  { rejectValue: string }
>('auth/sendPhoneOtpHomeowner', async (payload, thunkApi) => {
  try {
    const response = await apiRequest<SendPhoneOtpSuccessData>({
      method: 'POST',
      path: authEndpoints.sendPhoneOtp(),
      body: {
        phone: payload.phone,
      },
    });

    if (!response.success) {
      return thunkApi.rejectWithValue(response.message ?? 'Failed to send phone OTP');
    }

    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send phone OTP';
    return thunkApi.rejectWithValue(message);
  }
});

export const verifyPhoneOtpHomeowner = createAsyncThunk<
  VerifyPhoneOtpSuccessData,
  { phone: string; otp: string },
  { rejectValue: string }
>('auth/verifyPhoneOtpHomeowner', async (payload, thunkApi) => {
  try {
    const response = await apiRequest<VerifyPhoneOtpSuccessData>({
      method: 'POST',
      path: authEndpoints.verifyPhoneOtp(),
      body: {
        phone: payload.phone,
        otp: payload.otp,
      },
    });

    if (!response.success) {
      return thunkApi.rejectWithValue(response.message ?? 'Failed to verify phone OTP');
    }

    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to verify phone OTP';
    return thunkApi.rejectWithValue(message);
  }
});

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;

  forgotPasswordStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  forgotPasswordError: string | null;
  forgotPasswordResetToken: string | null;
  forgotPasswordResetTokenExpiresAt: string | null;

  verifyResetOtpStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  verifyResetOtpError: string | null;

  resetPasswordStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  resetPasswordError: string | null;

  registerStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  registerError: string | null;

  sendEmailOtpStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  sendEmailOtpError: string | null;

  verifyEmailOtpStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  verifyEmailOtpError: string | null;

  sendPhoneOtpStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  sendPhoneOtpError: string | null;

  verifyPhoneOtpStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  verifyPhoneOtpError: string | null;

  updateProfileStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  updateProfileError: string | null;
};

const initialState: AuthState = {
  accessToken: null,
  user: null,
  status: 'idle',
  error: null,

  forgotPasswordStatus: 'idle',
  forgotPasswordError: null,
  forgotPasswordResetToken: null,
  forgotPasswordResetTokenExpiresAt: null,

  verifyResetOtpStatus: 'idle',
  verifyResetOtpError: null,

  resetPasswordStatus: 'idle',
  resetPasswordError: null,

  registerStatus: 'idle',
  registerError: null,

  sendEmailOtpStatus: 'idle',
  sendEmailOtpError: null,

  verifyEmailOtpStatus: 'idle',
  verifyEmailOtpError: null,

  sendPhoneOtpStatus: 'idle',
  sendPhoneOtpError: null,

  verifyPhoneOtpStatus: 'idle',
  verifyPhoneOtpError: null,

  updateProfileStatus: 'idle',
  updateProfileError: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken(state, action: { payload: string | null }) {
      state.accessToken = action.payload;
    },
    signOut(state) {
      state.accessToken = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
    clearForgotPasswordState(state) {
      state.forgotPasswordStatus = 'idle';
      state.forgotPasswordError = null;
      state.forgotPasswordResetToken = null;
      state.forgotPasswordResetTokenExpiresAt = null;
      state.verifyResetOtpStatus = 'idle';
      state.verifyResetOtpError = null;
      state.resetPasswordStatus = 'idle';
      state.resetPasswordError = null;
    },
    clearRegisterState(state) {
      state.registerStatus = 'idle';
      state.registerError = null;
    },
    clearVerifyEmailState(state) {
      state.sendEmailOtpStatus = 'idle';
      state.sendEmailOtpError = null;
      state.verifyEmailOtpStatus = 'idle';
      state.verifyEmailOtpError = null;
    },
    clearVerifyPhoneState(state) {
      state.sendPhoneOtpStatus = 'idle';
      state.sendPhoneOtpError = null;
      state.verifyPhoneOtpStatus = 'idle';
      state.verifyPhoneOtpError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginHomeowner.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginHomeowner.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accessToken = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginHomeowner.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Login failed';
      });

    builder
      .addCase(forgotPasswordHomeowner.pending, (state) => {
        state.forgotPasswordStatus = 'loading';
        state.forgotPasswordError = null;
      })
      .addCase(forgotPasswordHomeowner.fulfilled, (state, action) => {
        state.forgotPasswordStatus = 'succeeded';
        state.forgotPasswordError = null;
      })
      .addCase(forgotPasswordHomeowner.rejected, (state, action) => {
        state.forgotPasswordStatus = 'failed';
        state.forgotPasswordError = action.payload ?? 'Failed to send OTP';
      });

    builder
      .addCase(verifyResetOtpHomeowner.pending, (state) => {
        state.verifyResetOtpStatus = 'loading';
        state.verifyResetOtpError = null;
      })
      .addCase(verifyResetOtpHomeowner.fulfilled, (state, action) => {
        state.verifyResetOtpStatus = 'succeeded';
        state.verifyResetOtpError = null;
        state.forgotPasswordResetToken = action.payload.reset_token;
        state.forgotPasswordResetTokenExpiresAt = action.payload.expires_at;
      })
      .addCase(verifyResetOtpHomeowner.rejected, (state, action) => {
        state.verifyResetOtpStatus = 'failed';
        state.verifyResetOtpError = action.payload ?? 'Failed to verify OTP';
      });

    builder
      .addCase(resetPasswordHomeowner.pending, (state) => {
        state.resetPasswordStatus = 'loading';
        state.resetPasswordError = null;
      })
      .addCase(resetPasswordHomeowner.fulfilled, (state) => {
        state.resetPasswordStatus = 'succeeded';
        state.resetPasswordError = null;
      })
      .addCase(resetPasswordHomeowner.rejected, (state, action) => {
        state.resetPasswordStatus = 'failed';
        state.resetPasswordError = action.payload ?? 'Failed to reset password';
      });

    builder
      .addCase(registerHomeowner.pending, (state) => {
        state.registerStatus = 'loading';
        state.registerError = null;
      })
      .addCase(registerHomeowner.fulfilled, (state, action) => {
        state.registerStatus = 'succeeded';
        state.user = action.payload.user;
        state.registerError = null;
      })
      .addCase(registerHomeowner.rejected, (state, action) => {
        state.registerStatus = 'failed';
        state.registerError = action.payload ?? 'Registration failed';
      });

    builder
      .addCase(sendEmailOtpHomeowner.pending, (state) => {
        state.sendEmailOtpStatus = 'loading';
        state.sendEmailOtpError = null;
      })
      .addCase(sendEmailOtpHomeowner.fulfilled, (state) => {
        state.sendEmailOtpStatus = 'succeeded';
        state.sendEmailOtpError = null;
      })
      .addCase(sendEmailOtpHomeowner.rejected, (state, action) => {
        state.sendEmailOtpStatus = 'failed';
        state.sendEmailOtpError = action.payload ?? 'Failed to send email OTP';
      });

    builder
      .addCase(verifyEmailOtpHomeowner.pending, (state) => {
        state.verifyEmailOtpStatus = 'loading';
        state.verifyEmailOtpError = null;
      })
      .addCase(verifyEmailOtpHomeowner.fulfilled, (state) => {
        state.verifyEmailOtpStatus = 'succeeded';
        state.verifyEmailOtpError = null;

        if (state.user) {
          state.user.email_verified = true;
        }
      })
      .addCase(verifyEmailOtpHomeowner.rejected, (state, action) => {
        state.verifyEmailOtpStatus = 'failed';
        state.verifyEmailOtpError = action.payload ?? 'Failed to verify email OTP';
      });

    builder
      .addCase(sendPhoneOtpHomeowner.pending, (state) => {
        state.sendPhoneOtpStatus = 'loading';
        state.sendPhoneOtpError = null;
      })
      .addCase(sendPhoneOtpHomeowner.fulfilled, (state) => {
        state.sendPhoneOtpStatus = 'succeeded';
        state.sendPhoneOtpError = null;
      })
      .addCase(sendPhoneOtpHomeowner.rejected, (state, action) => {
        state.sendPhoneOtpStatus = 'failed';
        state.sendPhoneOtpError = action.payload ?? 'Failed to send phone OTP';
      });

    builder
      .addCase(verifyPhoneOtpHomeowner.pending, (state) => {
        state.verifyPhoneOtpStatus = 'loading';
        state.verifyPhoneOtpError = null;
      })
      .addCase(verifyPhoneOtpHomeowner.fulfilled, (state) => {
        state.verifyPhoneOtpStatus = 'succeeded';
        state.verifyPhoneOtpError = null;

        if (state.user) {
          state.user.phone_verified = true;
        }
      })
      .addCase(verifyPhoneOtpHomeowner.rejected, (state, action) => {
        state.verifyPhoneOtpStatus = 'failed';
        state.verifyPhoneOtpError = action.payload ?? 'Failed to verify phone OTP';
      });

    builder
      .addCase(updateProfileHomeowner.pending, (state) => {
        state.updateProfileStatus = 'loading';
        state.updateProfileError = null;
      })
      .addCase(updateProfileHomeowner.fulfilled, (state, action) => {
        state.updateProfileStatus = 'succeeded';
        state.updateProfileError = null;

        const incoming: any = action.payload;
        const updated: AuthUser | undefined = incoming?.user;

        if (state.user) {
          state.user.first_name = updated?.first_name ?? incoming?.first_name ?? state.user.first_name;
          state.user.last_name = updated?.last_name ?? incoming?.last_name ?? state.user.last_name;
          state.user.address_line_1 = updated?.address_line_1 ?? incoming?.address_line_1 ?? state.user.address_line_1;
          state.user.city = updated?.city ?? incoming?.city ?? state.user.city;
          state.user.state = updated?.state ?? incoming?.state ?? state.user.state;
          state.user.zip = updated?.zip ?? incoming?.zip ?? state.user.zip;
        } else if (updated) {
          state.user = updated;
        }
      })
      .addCase(updateProfileHomeowner.rejected, (state, action) => {
        state.updateProfileStatus = 'failed';
        state.updateProfileError = action.payload ?? 'Failed to update profile';
      });
  },
});

export const authReducer = authSlice.reducer;
export const authActions = authSlice.actions;
