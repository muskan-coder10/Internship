import { useState } from "react";
import { NotificationContext } from "./NotificationContext.js";

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message) => {
    const newNotif = { id: Date.now(), message, read: false };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAllRead, unreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
}