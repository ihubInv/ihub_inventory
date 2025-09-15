import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '../types';
import { supabase } from '../../lib/supabaseClient';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  session: Session | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  session: null,
};

// Async thunks for auth operations
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        return rejectWithValue(error.message);
      }

      if (session?.user) {
        // Fetch user data from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          console.warn('User not found in users table, creating user record:', userError);
          
          // Create user record
          const newUserData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: (session.user.user_metadata?.name as string) || session.user.email?.split('@')[0] || 'User',
            role: ['admin', 'stock-manager', 'employee'].includes(session.user.user_metadata?.role as string)
              ? (session.user.user_metadata?.role as 'admin' | 'stock-manager' | 'employee')
              : 'employee',
            department: (session.user.user_metadata?.department as string) || '',
            isactive: true,
            createdat: new Date(session.user.created_at),
            lastlogin: new Date(session.user.last_sign_in_at ?? new Date()),
          };

          const { data: createdUser, error: createError } = await supabase
            .from('users')
            .insert([newUserData])
            .select();

          if (createError) {
            return rejectWithValue(createError.message);
          }

          return { session, user: createdUser[0] as User };
        }

        return { session, user: userData as User };
      }

      return { session: null, user: null };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initialize authentication');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return rejectWithValue(error.message);
      }

      if (data.user) {
        // Fetch user data from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          return rejectWithValue('User not found in database');
        }

        return { session: data.session, user: userData as User };
      }

      return rejectWithValue('No user data received');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return rejectWithValue(error.message);
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload.session;
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload.user;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
        state.session = null;
      })
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload.session;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
        state.session = null;
      })
      // Logout User
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.session = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Still clear the user even if logout failed
        state.user = null;
        state.isAuthenticated = false;
        state.session = null;
      });
  },
});

export const { setUser, setLoading, setError, clearError } = authSlice.actions;
export default authSlice.reducer;
