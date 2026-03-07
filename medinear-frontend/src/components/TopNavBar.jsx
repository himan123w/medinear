import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import Settings from './Settings';
import AlertsBell from './AlertsBell';
import './TopNavBar.css';

export default function TopNavBar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="top-nav-bar">
        <div className="nav-container">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <span className="nav-icon">🏥</span>
            <span className="nav-brand">MediNear</span>
          </Link>

          {/* Navigation Links */}
          {user && (
            <div className="nav-links">
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/prescriptions" className="nav-link">
                Prescriptions
              </Link>
              <Link to="/subscriptions" className="nav-link">
                Subscriptions
              </Link>
              <Link to="/delivery" className="nav-link">
                Delivery
              </Link>
              <Link to="/analytics/heatmap" className="nav-link">
                📊 Heatmap
              </Link>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="nav-actions">
            {/* Alerts Bell - Only show when user is logged in */}
            {user && <AlertsBell />}

            {/* Admin Panel - Only show for admin users */}
            {user && user.role === 'admin' && (
              <Link to="/admin" className="nav-link admin-btn" title="Admin Panel">
                🛡️ Admin
              </Link>
            )}

            {/* Pharmacy Panel - Only show for pharmacy users */}
            {user && user.role === 'pharmacy' && (
              <Link to="/pharmacy" className="nav-link pharmacy-btn" title="Pharmacy Dashboard">
                🏥 Pharmacy
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              className="nav-icon-btn"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Settings */}
            <button
              className="nav-icon-btn"
              onClick={() => setShowSettings(true)}
              aria-label="Open settings"
              title="Settings"
            >
              ⚙️
            </button>

            {/* User Menu */}
            {user ? (
              <div className="user-menu">
                <button
                  className="user-menu-btn"
                  onClick={() => setShowMenu(!showMenu)}
                  aria-label="User menu"
                >
                  <span className="user-avatar">👤</span>
                  <span className="user-name">{user.name || 'User'}</span>
                  <span className={`menu-arrow ${showMenu ? 'open' : ''}`}>▼</span>
                </button>

                {showMenu && (
                  <div className="user-dropdown">
                    <Link to="/profile" className="dropdown-item">
                      👤 Profile
                    </Link>
                    <Link to="/orders" className="dropdown-item">
                      📦 Orders
                    </Link>
                    <button
                      className="dropdown-item logout-btn"
                      onClick={handleLogout}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="nav-auth">
                <Link to="/login" className="btn btn-small">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-small">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button className="mobile-menu-btn" aria-label="Toggle mobile menu">
              ☰
            </button>
          </div>
        </div>
      </nav>

      {/* Settings Modal */}
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}
