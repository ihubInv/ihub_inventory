import { createApi } from '@reduxjs/toolkit/query/react';
import { supabase } from '../../lib/supabaseClient';
import { User, Notification } from '../../types';
import { baseQueryWithReauth } from './baseQuery';

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Notification'],
  endpoints: (builder) => ({
    // Get all users (for notifications)
    getUsers: builder.query<User[], void>({
      queryFn: async () => {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw new Error(error.message);
        return { data: data as User[] };
      },
      providesTags: ['User'],
    }),

    // Get user by ID
    getUserById: builder.query<User, string>({
      queryFn: async (id) => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw new Error(error.message);
        return { data: data as User };
      },
      providesTags: ['User'],
    }),

    // Create user
    createUser: builder.mutation<User, Omit<User, 'id' | 'createdat'>>({
      queryFn: async (newUser) => {
        const { data, error } = await supabase.from('users').insert([{
          ...newUser,
          createdat: new Date().toISOString()
        }]).select();
        if (error) throw new Error(error.message);
        return { data: data[0] as User };
      },
      invalidatesTags: ['User'],
    }),

    // Update user
    updateUser: builder.mutation<User, { id: string; updates: Partial<User> }>({
      queryFn: async ({ id, updates }) => {
        const { data, error } = await supabase
          .from('users')
          .update({
            ...updates,
            updatedat: new Date().toISOString()
          })
          .eq('id', id)
          .select();
        if (error) throw new Error(error.message);
        return { data: data[0] as User };
      },
      invalidatesTags: ['User'],
    }),

    // Delete user
    deleteUser: builder.mutation<void, string>({
      queryFn: async (id) => {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', id);
        if (error) throw new Error(error.message);
        return { data: undefined };
      },
      invalidatesTags: ['User'],
    }),

    // Search users
    searchUsers: builder.query<User[], string>({
      queryFn: async (searchTerm) => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
          .order('name', { ascending: true });
        if (error) throw new Error(error.message);
        return { data: data as User[] };
      },
      providesTags: ['User'],
    }),

    // Notification-related endpoints
    // Get unread count for current user
    getUnreadCount: builder.query<number, string>({
      queryFn: async (userId) => {
        if (!userId) {
          return { data: 0 };
        }
        
        // This will be calculated based on pending requests
        const { data: requests, error } = await supabase
          .from('requests')
          .select('*')
          .eq('status', 'pending');
        
        if (error) throw new Error(error.message);
        
        // Get user to determine role
        const { data: user } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();
        
        let count = 0;
        if (user) {
          if (user.role === 'employee') {
            count = requests.filter(req => req.employeeid === userId).length;
          } else if (user.role === 'admin' || user.role === 'stock-manager') {
            count = requests.length;
          }
        }
        
        return { data: count };
      },
      providesTags: ['Notification'],
    }),

    // Get notifications for current user (based on requests)
    getNotifications: builder.query<Notification[], string>({
      queryFn: async (userId) => {
        if (!userId) {
          return { data: [] };
        }
        
        // Get user to determine role
        const { data: user } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();
        
        if (!user) return { data: [] };
        
        let query = supabase.from('requests').select('*');
        
        if (user.role === 'employee') {
          query = query.eq('employeeid', userId);
        }
        // For admin/stock-manager, get all requests
        
        const { data: requests, error } = await query.order('submittedat', { ascending: false });
        
        if (error) throw new Error(error.message);
        
        // Convert requests to notifications
        const notifications: Notification[] = requests.map(req => ({
          employeeid: req.employeeid,
          employeename: req.employeename,
          itemtype: req.itemtype,
          justification: req.justification,
          purpose: req.purpose,
          quantity: req.quantity,
          remarks: req.remarks,
          reviewedat: req.reviewedat,
          reviewedby: req.reviewedby,
          reviewername: req.reviewername,
          status: req.status,
          submittedat: req.submittedat
        }));
        
        return { data: notifications };
      },
      providesTags: ['Notification'],
    }),

    // Get pending notifications
    getPendingNotifications: builder.query<Notification[], string>({
      queryFn: async (userId): Promise<{ data: Notification[] }> => {
        if (!userId) {
          return { data: [] };
        }
        
        // Get user to determine role
        const { data: user } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();
        
        if (!user) return { data: [] };
        
        let query = supabase.from('requests').select('*');
        
        if (user.role === 'employee') {
          query = query.eq('employeeid', userId);
        }
        // For admin/stock-manager, get all requests
        
        const { data: requests, error } = await query.order('submittedat', { ascending: false });
        
        if (error) throw new Error(error.message);
        
        // Convert requests to notifications and filter for pending
        const notifications: Notification[] = requests
          .map(req => ({
            employeeid: req.employeeid,
            employeename: req.employeename,
            itemtype: req.itemtype,
            justification: req.justification,
            purpose: req.purpose,
            quantity: req.quantity,
            remarks: req.remarks,
            reviewedat: req.reviewedat,
            reviewedby: req.reviewedby,
            reviewername: req.reviewername,
            status: req.status,
            submittedat: req.submittedat
          }))
          .filter(n => n.status === 'pending');
        
        return { data: notifications };
      },
      providesTags: ['Notification'],
    }),

    // Get approved notifications
    getApprovedNotifications: builder.query<Notification[], string>({
      queryFn: async (userId): Promise<{ data: Notification[] }> => {
        if (!userId) {
          return { data: [] };
        }
        
        // Get user to determine role
        const { data: user } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();
        
        if (!user) return { data: [] };
        
        let query = supabase.from('requests').select('*');
        
        if (user.role === 'employee') {
          query = query.eq('employeeid', userId);
        }
        // For admin/stock-manager, get all requests
        
        const { data: requests, error } = await query.order('submittedat', { ascending: false });
        
        if (error) throw new Error(error.message);
        
        // Convert requests to notifications and filter for approved
        const notifications: Notification[] = requests
          .map(req => ({
            employeeid: req.employeeid,
            employeename: req.employeename,
            itemtype: req.itemtype,
            justification: req.justification,
            purpose: req.purpose,
            quantity: req.quantity,
            remarks: req.remarks,
            reviewedat: req.reviewedat,
            reviewedby: req.reviewedby,
            reviewername: req.reviewername,
            status: req.status,
            submittedat: req.submittedat
          }))
          .filter(n => n.status === 'approved');
        
        return { data: notifications };
      },
      providesTags: ['Notification'],
    }),

    // Get rejected notifications
    getRejectedNotifications: builder.query<Notification[], string>({
      queryFn: async (userId): Promise<{ data: Notification[] }> => {
        if (!userId) {
          return { data: [] };
        }
        
        // Get user to determine role
        const { data: user } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();
        
        if (!user) return { data: [] };
        
        let query = supabase.from('requests').select('*');
        
        if (user.role === 'employee') {
          query = query.eq('employeeid', userId);
        }
        // For admin/stock-manager, get all requests
        
        const { data: requests, error } = await query.order('submittedat', { ascending: false });
        
        if (error) throw new Error(error.message);
        
        // Convert requests to notifications and filter for rejected
        const notifications: Notification[] = requests
          .map(req => ({
            employeeid: req.employeeid,
            employeename: req.employeename,
            itemtype: req.itemtype,
            justification: req.justification,
            purpose: req.purpose,
            quantity: req.quantity,
            remarks: req.remarks,
            reviewedat: req.reviewedat,
            reviewedby: req.reviewedby,
            reviewername: req.reviewername,
            status: req.status,
            submittedat: req.submittedat
          }))
          .filter(n => n.status === 'rejected');
        
        return { data: notifications };
      },
      providesTags: ['Notification'],
    }),
  }),
});

export const {
  // User management hooks
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useSearchUsersQuery,
  
  // Notification hooks
  useGetUnreadCountQuery,
  useGetNotificationsQuery,
  useGetPendingNotificationsQuery,
  useGetApprovedNotificationsQuery,
  useGetRejectedNotificationsQuery,
} = notificationApi;