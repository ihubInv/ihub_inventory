import React, { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { sendNotificationEmail } from '../../services/emailService';
import { Bell, Check, Trash2, AlertTriangle, CheckCircle, XCircle, Package, User, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const NotificationCenter: React.FC = () => {
  const { notifications, deleteNotification } = useNotifications();
  const { requests, updateRequestStatus, users } = useInventory();
  const { user } = useAuth();
  
  // State for managing approval/rejection
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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
        return 'from-blue-500 to-cyan-600';
      case 'approved':
        return 'from-green-500 to-teal-600';
      case 'rejected':
        return 'from-red-500 to-pink-600';
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

  const pendingNotifications = filteredNotifications.filter(n => n.status === 'pending');
  const approvedNotifications = filteredNotifications.filter(n => n.status === 'approved');
  const rejectedNotifications = filteredNotifications.filter(n => n.status === 'rejected');

  const handleDeleteNotification = (notificationId: string) => {
    // Find the index of the notification in the requests array
    const index = requests.findIndex(req => req.id === notificationId);
    if (index !== -1) {
      deleteNotification(index);
    }
  };

  const handleAction = async () => {
    if (!selectedRequest || !selectedAction || !reason.trim()) {
      toast.error(`Please provide a reason for ${selectedAction}`);
      return;
    }
    
    setIsProcessing(true);
    try {
      const requestToUpdate = requests.find(req => req.id === selectedRequest);
      if (!requestToUpdate) {
        toast.error("Request not found.");
        setIsProcessing(false);
        return;
      }

      const employee = users.find(u => u.id === requestToUpdate.employeeid);
      if (!employee) {
        toast.error("Employee not found for this request.");
        setIsProcessing(false);
        return;
      }

      const newStatus = selectedAction === 'approve' ? 'approved' : 'rejected';
      await updateRequestStatus(selectedRequest, newStatus, reason, user?.id);
      
      // Send email to employee
      sendNotificationEmail(
        selectedAction === 'approve' ? 'requestApproved' : 'requestRejected',
        employee.email,
        employee.name,
        {
          employeename: employee.name,
          itemtype: requestToUpdate.itemtype,
          quantity: requestToUpdate.quantity,
          remarks: reason,
          from_name: user?.name || 'Admin/Stock Manager',
        }
      );
      setSelectedRequest(null);
      setSelectedAction(null);
      setReason('');
      // Show success message
      toast.success(`Request ${selectedAction}d successfully!`);
    } catch (error) {
      console.error(`Error ${selectedAction}ing request:`, error);
      toast.error(`Failed to ${selectedAction} request. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const openReasonModal = (requestId: string, action: 'approve' | 'reject') => {
    setSelectedRequest(requestId);
    setSelectedAction(action);
    setReason('');
  };

  const closeReasonModal = () => {
    setSelectedRequest(null);
    setSelectedAction(null);
    setReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-gray-600">Stay updated with your request status</p>
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
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600">
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
            <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600">
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
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600">
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
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600">
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
                                onClick={() => openReasonModal(notification.id, 'approve')}
                                className="p-2 text-green-600 transition-colors rounded-lg hover:text-green-700 hover:bg-green-50"
                                title="Approve Request"
                              >
                                <ThumbsUp size={16} />
                              </button>
                              <button
                                onClick={() => openReasonModal(notification.id, 'reject')}
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
                            <Trash2 size={16} />
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
                          <Trash2 size={16} />
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
                          <Trash2 size={16} />
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

      {/* Reason Modal */}
      {selectedRequest && selectedAction && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeReasonModal}
        >
          <div 
            className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Provide Reason for {selectedAction === 'approve' ? 'Approval' : 'Rejection'}
              </h3>
              <button
                onClick={closeReasonModal}
                className="p-1 text-gray-400 transition-colors rounded hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Reason *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`Enter your reason for ${selectedAction === 'approve' ? 'approval' : 'rejection'}...`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                autoFocus
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleAction}
                disabled={isProcessing || !reason.trim()}
                className={`flex-1 px-4 py-2 text-white font-medium transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  selectedAction === 'approve' ? 'Approve Request' : 'Reject Request'
                )}
              </button>
              <button
                onClick={closeReasonModal}
                disabled={isProcessing}
                className="px-6 py-2 text-gray-600 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
