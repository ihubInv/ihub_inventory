import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../../lib/supabaseClient';
import { RootState } from '../index';
import { logoutUser } from '../slices/authSlice';

// Base query with interceptors
export const baseQuery = fetchBaseQuery({
  baseUrl: '', // We'll use Supabase directly
  prepareHeaders: (headers, { getState }) => {
    // Get auth token from Redux state
    const session = (getState() as RootState).auth.session;
    if (session?.access_token) {
      headers.set('authorization', `Bearer ${session.access_token}`);
    }
    return headers;
  },
});

// Enhanced base query with error handling and retry logic
export const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Handle authentication errors
  if (result.error && result.error.status === 401) {
    // Try to refresh the session
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (session) {
      // Update Redux state with new session
      api.dispatch({ type: 'auth/setUser', payload: session.user });
      // Retry the original query with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Clear auth state and redirect to login
      api.dispatch(logoutUser());
    }
  }
  
  return result;
};
