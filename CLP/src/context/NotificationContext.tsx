import React, { createContext, useState, useContext, ReactNode } from 'react';
import NotificationSystem, { Notification, NotificationType } from '../components/NotificationSystem';
import { v4 as uuidv4 } from 'uuid'; // updated import for uuid

interface NotificationContextProps {
  showNotification: (
    type: NotificationType,
    message: string,
    title?: string,
    autoClose?: boolean,
    duration?: number
  ) => string;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextProps>({
  showNotification: () => '',
  removeNotification: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (
    type: NotificationType,
    message: string,
    title?: string,
    autoClose = true,
    duration = 5000
  ): string => {
    const id = uuidv4();
    setNotifications(prev => [...prev, {
      id,
      type,
      message,
      title,
      autoClose,
      duration
    }]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification, removeNotification }}>
      {children}
      <NotificationSystem 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
    </NotificationContext.Provider>
  );
};
