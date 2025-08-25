import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { sendNotificationEmail } from '../../services/emailService';
import { Bell, Check, Trash2, AlertTriangle, CheckCircle, XCircle, Package, User } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../contexts/AuthContext';

const NotificationCenter: React.FC = () => {
  const { notifications, deleteNotification } = useNotifications();
  const { requests } = useInventory();
  const { user } = useAuth();

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
                          <p className="text-sm text-gray-500 mt-1">
                            {notification.justification}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Submitted {formatTime(notification.submittedat)}
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
    </div>
  );
};

export default NotificationCenter;
