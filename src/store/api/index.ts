// Barrel export file - re-exports all API hooks and instances for backward compatibility

// Export API instances
export { inventoryApi } from './inventoryApi';
export { requestApi } from './requestApi';
export { categoriesApi } from './categoriesApi';
export { notificationApi } from './notificationApi';
export { authApi } from './authApi';
export { locationApi } from './locationApi';

// Export hooks
export {
  // Inventory API
  useGetInventoryItemsQuery,
  useGetInventoryItemByIdQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
  useSearchInventoryItemsQuery,
} from './inventoryApi';

export {
  // Request API
  useGetRequestsQuery,
  useGetRequestByIdQuery,
  useGetRequestsByEmployeeQuery,
  useGetPendingRequestsQuery,
  useCreateRequestMutation,
  useUpdateRequestStatusMutation,
  useUpdateRequestMutation,
  useDeleteRequestMutation,
} from './requestApi';

export {
  // Categories API
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useCanDeleteCategoryQuery,
  useCanRemoveAssetNamesFromCategoryQuery,
  useGetAssetsQuery,
  useGetAssetByIdQuery,
  useGetAssetsByCategoryQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
  useCanDeleteAssetQuery,
} from './categoriesApi';

export {
  // Notification/Users API
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useSearchUsersQuery,
  useGetUnreadCountQuery,
  useGetNotificationsQuery,
  useGetPendingNotificationsQuery,
  useGetApprovedNotificationsQuery,
  useGetRejectedNotificationsQuery,
} from './notificationApi';

export {
  // Auth API
  useGetCurrentUserQuery,
  useUpdateUserProfileMutation,
  useRefreshSessionMutation,
} from './authApi';

export {
  // Location API
  useGetLocationsQuery,
  useGetActiveLocationsQuery,
  useGetLocationByIdQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useToggleLocationStatusMutation,
  useGetLocationStatsQuery,
  useSearchLocationsQuery,
} from './locationApi';
