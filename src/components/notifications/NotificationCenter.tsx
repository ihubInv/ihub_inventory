import React, { useState } from 'react';
import { sendNotificationEmail } from '../../services/emailService';
import { Bell, Check, Trash2, AlertTriangle, CheckCircle, XCircle, Package, User, ThumbsUp, ThumbsDown } from 'lucide-react';
import { 
  useGetRequestsQuery,
  useUpdateRequestStatusMutation,
  useDeleteRequestMutation,
  useGetUsersQuery,
  useGetNotificationsQuery,
  useGetPendingNotificationsQuery,
  useGetApprovedNotificationsQuery,
  useGetRejectedNotificationsQuery
} from '../../store/api';
import { useAppSelector } from '../../store/hooks';
import RequestApprovalModal from '../requests/RequestApprovalModal';
import toast from 'react-hot-toast';

const NotificationCenter: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: notifications = [] } = useGetNotificationsQuery(user?.id || '', {
    skip: !user?.id
  });
  const { data: pendingNotifications = [] } = useGetPendingNotificationsQuery(user?.id || '', {
    skip: !user?.id
  });
  const { data: approvedNotifications = [] } = useGetApprovedNotificationsQuery(user?.id || '', {
    skip: !user?.id
  });
  const { data: rejectedNotifications = [] } = useGetRejectedNotificationsQuery(user?.id || '', {
    skip: !user?.id
  });
  const { data: requests = [] } = useGetRequestsQuery();
  const [updateRequestStatus] = useUpdateRequestStatusMutation();
  const [deleteRequest] = useDeleteRequestMutation();
  const { data: users = [] } = useGetUsersQuery();
  
  // State for managing approval/rejection
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Filter notifications based on user role
  const getFilteredNotifications = () => {
    if (user?.role === 'employee') {
      // Employees see only their own requests
      return requests.filter(req => req.employeeid === user.id);
    } else if (user?.role === 'admin' || user?.role === 'stock-manager') {
      // Admins and stock managers see all requests
      return requests;
    }
    return [];
  };

  const filteredNotifications = getFilteredNotifications();

  const getNotificationIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Bell;
      case 'approved':
        return CheckCircle;
      case 'rejected':
        return XCircle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'from-[#0d559e] to-[#1a6bb8]';
      case 'approved':
        return 'from-[#0d559e] to-[#1a6bb8]';
      case 'rejected':
        return 'from-[#0d559e] to-[#1a6bb8]';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteRequest(notificationId);
      toast.success('Request deleted successfully');
    } catch (error) {
      console.error('Failed to delete request:', error);
      toast.error('Failed to delete request');
    }
  };

  // Delete specific notification by employee ID and submission date
  const handleDeleteNotificationById = async (employeeId: string, submittedAt: string) => {
    try {
      const requestToDelete = requests.find(req => 
        req.employeeid === employeeId && req.submittedat === submittedAt
      );
      if (requestToDelete) {
        await deleteRequest(requestToDelete.id);
        toast.success('Request deleted successfully');
      } else {
        toast.error('Request not found');
      }
    } catch (error) {
      console.error('Failed to delete request:', error);
      toast.error('Failed to delete request');
    }
  };

  // Delete all approved notifications
  const handleDeleteApprovedNotifications = async () => {
    if (approvedNotifications.length === 0) {
      toast.error('No approved requests to delete');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete all ${approvedNotifications.length} approved requests?`)) {
      try {
        const deletePromises = approvedNotifications.map(request => deleteRequest(request.id));
        await Promise.all(deletePromises);
        toast.success(`${approvedNotifications.length} approved requests deleted successfully`);
      } catch (error) {
        console.error('Failed to delete approved requests:', error);
        toast.error('Failed to delete approved requests');
      }
    }
  };

  // Delete all rejected notifications
  const handleDeleteRejectedNotifications = async () => {
    if (rejectedNotifications.length === 0) {
      toast.error('No rejected requests to delete');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete all ${rejectedNotifications.length} rejected requests?`)) {
      try {
        const deletePromises = rejectedNotifications.map(request => deleteRequest(request.id));
        await Promise.all(deletePromises);
        toast.success(`${rejectedNotifications.length} rejected requests deleted successfully`);
      } catch (error) {
        console.error('Failed to delete rejected requests:', error);
        toast.error('Failed to delete rejected requests');
      }
    }
  };

  // Delete all notifications
  const handleDeleteAllNotifications = async () => {
    if (filteredNotifications.length === 0) {
      toast.error('No requests to delete');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete all ${filteredNotifications.length} requests?`)) {
      try {
        const deletePromises = filteredNotifications.map(request => deleteRequest(request.id));
        await Promise.all(deletePromises);
        toast.success(`${filteredNotifications.length} requests deleted successfully`);
      } catch (error) {
        console.error('Failed to delete requests:', error);
        toast.error('Failed to delete requests');
      }
    }
  };

  const openApprovalModal = (request: any, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setSelectedAction(action);
    setShowApprovalModal(true);
  };

  const closeApprovalModal = () => {
    setSelectedRequest(null);
    setSelectedAction(null);
    setShowApprovalModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-gray-600">Stay updated with your request status</p>
        </div>
        <div className="flex items-center space-x-3">
          {approvedNotifications.length > 0 && (
            <button
              onClick={handleDeleteApprovedNotifications}
              className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              title="Delete all approved notifications"
            >
              <Trash2 size={16} className="text-red-500" />
              <span>Clear Approved</span>
            </button>
          )}
          {rejectedNotifications.length > 0 && (
            <button
              onClick={handleDeleteRejectedNotifications}
              className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              title="Delete all rejected notifications"
            >
              <Trash2 size={16} className="text-red-500" />
              <span>Clear Rejected</span>
            </button>
          )}
          {filteredNotifications.length > 0 && (
            <button
              onClick={handleDeleteAllNotifications}
              className="flex items-center px-4 py-2 space-x-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Delete all notifications"
            >
              <Trash2 size={16} className="text-red-500" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{filteredNotifications.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#0d559e] to-[#1a6bb8]">
              <Bell className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingNotifications.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#0d559e] to-[#1a6bb8]">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{approvedNotifications.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#0d559e] to-[#1a6bb8]">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{rejectedNotifications.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#0d559e] to-[#1a6bb8]">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-6">
        {/* Pending Notifications */}
        {pendingNotifications.length > 0 && (
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Pending Requests ({pendingNotifications.length})
              </h3>
            </div>
            
            <div className="space-y-4">
              {pendingNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.status);
                const iconColor = getNotificationColor(notification.status);
                
                return (
                  <div key={notification.id} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${iconColor}`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {notification.itemtype} Request
                          </h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {notification.quantity} - {notification.purpose}
                          </p>
                          {(user?.role === 'admin' || user?.role === 'stock-manager') && (
                            <p className="text-sm text-blue-600 mt-1">
                              Requested by: {notification.employeename}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {notification.justification}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Submitted {formatTime(notification.submittedat)}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* Only show approve/reject buttons for admin and stock managers */}
                          {(user?.role === 'admin' || user?.role === 'stock-manager') && (
                            <>
                              <button
                                onClick={() => openApprovalModal(notification, 'approve')}
                                className="p-2 text-green-600 transition-colors rounded-lg hover:text-green-700 hover:bg-green-50"
                                title="Approve Request"
                              >
                                <ThumbsUp size={16} />
                              </button>
                              <button
                                onClick={() => openApprovalModal(notification, 'reject')}
                                className="p-2 text-red-600 transition-colors rounded-lg hover:text-red-700 hover:bg-red-50"
                                title="Reject Request"
                              >
                                <ThumbsDown size={16} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="p-1 text-gray-400 transition-colors rounded hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Approved Notifications */}
        {approvedNotifications.length > 0 && (
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Approved Requests ({approvedNotifications.length})
              </h3>
            </div>
            
            <div className="space-y-4">
              {approvedNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.status);
                const iconColor = getNotificationColor(notification.status);
                
                return (
                  <div key={notification.id} className="flex items-start space-x-4 p-4 rounded-lg bg-green-50">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${iconColor}`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {notification.itemtype} Request Approved
                          </h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {notification.quantity} - {notification.purpose}
                          </p>
                          {(user?.role === 'admin' || user?.role === 'stock-manager') && (
                            <p className="text-sm text-blue-600 mt-1">
                              Requested by: {notification.employeename}
                            </p>
                          )}
                          {notification.remarks && (
                            <p className="text-sm text-gray-500 mt-1">
                              Remarks: {notification.remarks}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Approved {notification.reviewedat ? formatTime(notification.reviewedat) : 'recently'}
                            {notification.reviewername && ` by ${notification.reviewername}`}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="p-1 text-gray-400 transition-colors rounded hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rejected Notifications */}
        {rejectedNotifications.length > 0 && (
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Rejected Requests ({rejectedNotifications.length})
              </h3>
            </div>
            
            <div className="space-y-4">
              {rejectedNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.status);
                const iconColor = getNotificationColor(notification.status);
                
                return (
                  <div key={notification.id} className="flex items-start space-x-4 p-4 rounded-lg bg-red-50">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${iconColor}`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {notification.itemtype} Request Rejected
                          </h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {notification.quantity} - {notification.purpose}
                          </p>
                          {(user?.role === 'admin' || user?.role === 'stock-manager') && (
                            <p className="text-sm text-blue-600 mt-1">
                              Requested by: {notification.employeename}
                            </p>
                          )}
                          {notification.remarks && (
                            <p className="text-sm text-gray-500 mt-1">
                              Reason: {notification.remarks}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Rejected {notification.reviewedat ? formatTime(notification.reviewedat) : 'recently'}
                            {notification.reviewername && ` by ${notification.reviewername}`}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="p-1 text-gray-400 transition-colors rounded hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Notifications */}
        {filteredNotifications.length === 0 && (
          <div className="p-12 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No notifications</h3>
            <p className="text-gray-600">You're all caught up! Notifications will appear here when you have updates.</p>
          </div>
        )}
      </div>

      {/* Request Approval Modal */}
      <RequestApprovalModal
        isOpen={showApprovalModal}
        onClose={closeApprovalModal}
        request={selectedRequest}
        action={selectedAction || 'approve'}
      />
    </div>
  );
};

export default NotificationCenter;
