import { createApi } from '@reduxjs/toolkit/query/react';
import { supabase } from '../../lib/supabaseClient';
import { User } from '../../types';
import { baseQueryWithReauth } from './baseQuery';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Get current user
    getCurrentUser: builder.query<User, void>({
      queryFn: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          return { error: { status: 401, data: 'No active session' } };
        }

        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw new Error(error.message);
        return { data: userData as User };
      },
      providesTags: ['User'],
    }),

    // Update user profile
    updateUserProfile: builder.mutation<User, { id: string; updates: Partial<User> }>({
      queryFn: async ({ id, updates }) => {
        const { data, error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', id)
          .select();
        if (error) throw new Error(error.message);
        return { data: data[0] as User };
      },
      invalidatesTags: ['User'],
    }),

    // Refresh session
    refreshSession: builder.mutation<any, void>({
      queryFn: async () => {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw new Error(error.message);
        return { data };
      },
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useUpdateUserProfileMutation,
  useRefreshSessionMutation,
} = authApi;
