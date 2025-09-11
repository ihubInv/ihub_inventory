import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Notification } from '../types';
import { useInventory } from './InventoryContext';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  deleteNotification: (index: number) => void;
  deleteNotificationById: (employeeId: string, submittedAt: string) => void;
  deleteApprovedNotifications: () => void;
  deleteRejectedNotifications: () => void;
  deleteAllNotifications: () => void;
  pendingNotifications: Notification[];
  approvedNotifications: Notification[];
  rejectedNotifications: Notification[];
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { requests } = useInventory();
  const { user } = useAuth();

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const deleteNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  // Delete notification by employee ID and submission date (unique identifier)
  const deleteNotificationById = (employeeId: string, submittedAt: string) => {
    setNotifications(prev => prev.filter(notification => 
      !(notification.employeeid === employeeId && notification.submittedat === submittedAt)
    ));
  };

  // Delete all approved notifications
  const deleteApprovedNotifications = () => {
    setNotifications(prev => prev.filter(notification => notification.status !== 'approved'));
  };

  // Delete all rejected notifications
  const deleteRejectedNotifications = () => {
    setNotifications(prev => prev.filter(notification => notification.status !== 'rejected'));
  };

  // Delete all notifications
  const deleteAllNotifications = () => {
    setNotifications([]);
  };

  // Calculate unread count based on user role and pending requests
  const getUnreadCount = () => {
    if (!user) return 0;
    
    if (user.role === 'employee') {
      // Employees see count of their own pending requests
      return requests.filter(req => req.employeeid === user.id && req.status === 'pending').length;
    } else if (user.role === 'admin' || user.role === 'stock-manager') {
      // Admins and stock managers see count of all pending requests
      return requests.filter(req => req.status === 'pending').length;
    }
    return 0;
  };

  const unreadCount = getUnreadCount();
  
  const pendingNotifications = notifications.filter(n => n.status === 'pending');
  const approvedNotifications = notifications.filter(n => n.status === 'approved');
  const rejectedNotifications = notifications.filter(n => n.status === 'rejected');

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      deleteNotification,
      deleteNotificationById,
      deleteApprovedNotifications,
      deleteRejectedNotifications,
      deleteAllNotifications,
      pendingNotifications,
      approvedNotifications,
      rejectedNotifications,
      unreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

