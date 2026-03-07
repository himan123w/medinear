import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './BottomNavigation.css';

export default function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showMore, setShowMore] = useState(false);

  // Hide bottom nav on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const navItems = [
    {
      icon: '🏠',
      label: 'Home',
      path: '/',
      show: true
    },
    {
      icon: '📍',
      label: 'Near Me',
      path: '/pharmacies',
      show: true
    },
    {
      icon: '🔍',
      label: 'Search',
      path: '/search',
      show: true
    },
    {
      icon: '💊',
      label: 'Pharmacies',
      path: '/pharmacies',
      show: true
    },
    {
      icon: '👤',
      label: 'Profile',
      path: user ? '/dashboard' : '/login',
      show: true
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-navigation">
      <div className="bottom-nav-container">
        {navItems.map((item) => (
          item.show && (
            <Link
              key={`${item.path}-${item.label}`}
              to={item.path}
              className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
              title={item.label}
            >
              <span className="bottom-nav-icon">{item.icon}</span>
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          )
        ))}
      </div>
    </nav>
  );
}
