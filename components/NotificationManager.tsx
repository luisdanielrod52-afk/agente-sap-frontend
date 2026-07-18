'use client';

import { useState, useEffect } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'progress';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  progress?: number;
}

interface NotificationManagerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export default function NotificationManager({ notifications, onDismiss }: NotificationManagerProps) {
  return (
    <div className="fixed bottom-24 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

function NotificationItem({ notification, onDismiss }: { notification: Notification; onDismiss: (id: string) => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (notification.type === 'progress' && notification.progress !== undefined) {
      setProgress(notification.progress);
    }
  }, [notification.progress]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'progress': return '⏳';
      default: return 'ℹ️';
    }
  };

  const getColors = () => {
    switch (notification.type) {
      case 'success': return 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-400 dark:text-green-300';
      case 'warning': return 'bg-yellow-50 border-yellow-500 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-400 dark:text-yellow-300';
      case 'error': return 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-400 dark:text-red-300';
      case 'progress': return 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-300';
      default: return 'bg-gray-50 border-gray-500 text-gray-700 dark:bg-gray-800 dark:border-gray-400 dark:text-gray-300';
    }
  };

  return (
    <div className={`p-4 rounded-xl border-l-4 shadow-lg animate-in slide-in-from-right-5 ${getColors()}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{getIcon()}</span>
        <div className="flex-1">
          <p className="text-sm font-medium">{notification.title}</p>
          {notification.message && (
            <p className="text-xs opacity-80 mt-0.5">{notification.message}</p>
          )}
          {notification.type === 'progress' && (
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        <button
          onClick={() => onDismiss(notification.id)}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>
    </div>
  );
}