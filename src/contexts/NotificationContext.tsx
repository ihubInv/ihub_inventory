import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  deleteNotification: (index: number) => void;
  pendingNotifications: Notification[];
  approvedNotifications: Notification[];
  rejectedNotifications: Notification[];
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

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const deleteNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };


  
  const pendingNotifications = notifications.filter(n => n.status === 'pending');
  const approvedNotifications = notifications.filter(n => n.status === 'approved');
  const rejectedNotifications = notifications.filter(n => n.status === 'rejected');

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      deleteNotification,
      pendingNotifications,
      approvedNotifications,
      rejectedNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

