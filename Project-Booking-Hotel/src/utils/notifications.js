/**
 * Notification/Toast System
 * Centralized notification handling for the application
 */

// Store active notifications
let notifications = [];
let notificationId = 0;
let listeners = [];

/**
 * Subscribe to notification changes
 */
export const subscribeToNotifications = (callback) => {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
};

/**
 * Notify all listeners
 */
const notifyListeners = () => {
  listeners.forEach(listener => listener([...notifications]));
};

/**
 * Show notification
 */
export const showNotification = (message, type = 'info', duration = 3000) => {
  const id = notificationId++;
  const notification = {
    id,
    message,
    type, // 'success', 'error', 'warning', 'info'
    duration
  };

  notifications.push(notification);
  notifyListeners();

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }

  return id;
};

/**
 * Remove notification
 */
export const removeNotification = (id) => {
  notifications = notifications.filter(n => n.id !== id);
  notifyListeners();
};

/**
 * Success notification
 */
export const notifySuccess = (message, duration = 3000) => {
  return showNotification(message, 'success', duration);
};

/**
 * Error notification
 */
export const notifyError = (message, duration = 5000) => {
  return showNotification(message, 'error', duration);
};

/**
 * Warning notification
 */
export const notifyWarning = (message, duration = 4000) => {
  return showNotification(message, 'warning', duration);
};

/**
 * Info notification
 */
export const notifyInfo = (message, duration = 3000) => {
  return showNotification(message, 'info', duration);
};

/**
 * Get all notifications
 */
export const getNotifications = () => {
  return [...notifications];
};

/**
 * Clear all notifications
 */
export const clearNotifications = () => {
  notifications = [];
  notifyListeners();
};
