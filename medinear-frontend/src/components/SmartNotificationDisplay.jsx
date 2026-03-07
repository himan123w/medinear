/**
 * Smart Notification Display Component
 * Shows engaging, animated notifications for stock updates and inventory changes
 */

import { useState, useEffect } from 'react';
import './SmartNotificationDisplay.css';

export default function SmartNotificationDisplay({ 
  notification, 
  onClose,
  duration = 5000 
}) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      setProgress(100);

      // Auto-close after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      // Progress bar animation
      const interval = setInterval(() => {
        setProgress(prev => Math.max(0, prev - (100 / (duration / 100))));
      }, 100);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [notification, duration]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300); // Wait for animation
  };

  if (!notification) return null;

  const { title, body, icon } = notification;

  return (
    <div className={`smart-notification ${visible ? 'visible' : 'hidden'}`}>
      <div className="notification-content">
        <span className="notification-icon">{icon || '🔔'}</span>
        <div className="notification-text">
          <div className="notification-title">{title}</div>
          {body && <div className="notification-body">{body}</div>}
        </div>
        <button 
          className="notification-close" 
          onClick={handleClose}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
      <div className="notification-progress">
        <div 
          className="notification-progress-bar" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
