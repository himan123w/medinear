import { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { useToast } from '../ToastContext';
import './Settings.css';

export default function Settings({ isOpen, onClose }) {
  const { isDark, toggleTheme } = useTheme();
  const { success } = useToast();
  const [notifications, setNotifications] = useState({
    pushNotifications: localStorage.getItem('pushNotifications') !== 'false',
    emailNotifications: localStorage.getItem('emailNotifications') !== 'false',
    smsAlerts: localStorage.getItem('smsAlerts') !== 'false',
  });

  const handleToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    localStorage.setItem(key, (!notifications[key]).toString());
    success(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} turned ${!notifications[key] ? 'on' : 'off'}`);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>⚙️ Settings & Preferences</h2>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          {/* Theme Settings */}
          <div className="settings-section">
            <h3>🌙 Appearance</h3>
            <div className="settings-item">
              <div className="settings-label">
                <span>Dark Mode</span>
                <span className="settings-description">Switch to dark theme for better readability</span>
              </div>
              <button
                className={`toggle-switch ${isDark ? 'active' : ''}`}
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
              >
                <span className="toggle-slider"></span>
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="settings-section">
            <h3>🔔 Notifications</h3>
            
            <div className="settings-item">
              <div className="settings-label">
                <span>Push Notifications</span>
                <span className="settings-description">Receive browser notifications</span>
              </div>
              <button
                className={`toggle-switch ${notifications.pushNotifications ? 'active' : ''}`}
                onClick={() => handleToggle('pushNotifications')}
                aria-label="Toggle push notifications"
              >
                <span className="toggle-slider"></span>
              </button>
            </div>

            <div className="settings-item">
              <div className="settings-label">
                <span>Email Notifications</span>
                <span className="settings-description">Get email updates about orders</span>
              </div>
              <button
                className={`toggle-switch ${notifications.emailNotifications ? 'active' : ''}`}
                onClick={() => handleToggle('emailNotifications')}
                aria-label="Toggle email notifications"
              >
                <span className="toggle-slider"></span>
              </button>
            </div>

            <div className="settings-item">
              <div className="settings-label">
                <span>SMS Alerts</span>
                <span className="settings-description">Receive SMS for important updates</span>
              </div>
              <button
                className={`toggle-switch ${notifications.smsAlerts ? 'active' : ''}`}
                onClick={() => handleToggle('smsAlerts')}
                aria-label="Toggle SMS alerts"
              >
                <span className="toggle-slider"></span>
              </button>
            </div>
          </div>

          {/* About Section */}
          <div className="settings-section">
            <h3>ℹ️ About</h3>
            <div className="settings-info">
              <p><strong>App Name:</strong> 🏥 MediNear</p>
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Theme:</strong> {isDark ? 'Dark' : 'Light'} Mode</p>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
}
