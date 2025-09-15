import { createApi } from '@reduxjs/toolkit/query/react';
import { supabase } from '../../lib/supabaseClient';
import { Request } from '../../types';
import { baseQueryWithReauth } from './baseQuery';

export const requestApi = createApi({
  reducerPath: 'requestApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Request'],
  endpoints: (builder) => ({
    // Get all requests
    getRequests: builder.query<Request[], void>({
      queryFn: async () => {
        const { data, error } = await supabase.from('requests').select('*');
        if (error) throw new Error(error.message);
        return { data: data as Request[] };
      },
      providesTags: ['Request'],
    }),

    // Get request by ID
    getRequestById: builder.query<Request, string>({
      queryFn: async (id) => {
        const { data, error } = await supabase
          .from('requests')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw new Error(error.message);
        return { data: data as Request };
      },
      providesTags: ['Request'],
    }),

    // Get requests by employee ID
    getRequestsByEmployee: builder.query<Request[], string>({
      queryFn: async (employeeId) => {
        const { data, error } = await supabase
          .from('requests')
          .select('*')
          .eq('employeeid', employeeId);
        if (error) throw new Error(error.message);
        return { data: data as Request[] };
      },
      providesTags: ['Request'],
    }),

    // Get pending requests
    getPendingRequests: builder.query<Request[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('requests')
          .select('*')
          .eq('status', 'pending');
        if (error) throw new Error(error.message);
        return { data: data as Request[] };
      },
      providesTags: ['Request'],
    }),

    // Create request
    createRequest: builder.mutation<Request, Omit<Request, 'id' | 'submittedat' | 'status'>>({
      queryFn: async (newRequest) => {
        const { data, error } = await supabase.from('requests').insert([{
          ...newRequest,
          submittedat: new Date().toISOString(),
          status: 'pending'
        }]).select();
        if (error) throw new Error(error.message);
        return { data: data[0] as Request };
      },
      invalidatesTags: ['Request'],
    }),

    // Update request status
    updateRequestStatus: builder.mutation<Request, { id: string; status: 'approved' | 'rejected'; remarks?: string; reviewerid?: string }>({
      queryFn: async ({ id, status, remarks, reviewerid }) => {
        const { data, error } = await supabase.from('requests').update({
          status,
          remarks,
          reviewedby: reviewerid,
          reviewedat: new Date().toISOString()
        }).eq('id', id).select();
        if (error) throw new Error(error.message);
        return { data: data[0] as Request };
      },
      invalidatesTags: ['Request'],
    }),

    // Update request
    updateRequest: builder.mutation<Request, { id: string; updates: Partial<Request> }>({
      queryFn: async ({ id, updates }) => {
        const { data, error } = await supabase
          .from('requests')
          .update(updates)
          .eq('id', id)
          .select();
        if (error) throw new Error(error.message);
        return { data: data[0] as Request };
      },
      invalidatesTags: ['Request'],
    }),

    // Delete request
    deleteRequest: builder.mutation<void, string>({
      queryFn: async (id) => {
        const { error } = await supabase.from('requests').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return { data: undefined };
      },
      invalidatesTags: ['Request'],
    }),
  }),
});

export const {
  useGetRequestsQuery,
  useGetRequestByIdQuery,
  useGetRequestsByEmployeeQuery,
  useGetPendingRequestsQuery,
  useCreateRequestMutation,
  useUpdateRequestStatusMutation,
  useUpdateRequestMutation,
  useDeleteRequestMutation,
} = requestApi;
