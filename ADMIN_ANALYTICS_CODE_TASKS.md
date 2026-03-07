# Admin & Analytics Implementation Code Tasks
**3-Month Execution Plan: Code Scaffolds & Implementation Guides**

---

## MONTH 1: Foundation Setup

### ✅ Task 1.1: AdminLayout Component

**File**: `src/components/AdminPanel/AdminLayout.jsx`

```jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminBreadcrumbs from './AdminBreadcrumbs';
import './AdminLayout.css';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="admin-container">
      <AdminSidebar isOpen={sidebarOpen} />
      
      <main className={`admin-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <AdminBreadcrumbs />
        
        <div className="admin-content">
          <Outlet />
        </div>
      </main>

      {/* Mobile menu toggle */}
      <button 
        className="mobile-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>
    </div>
  );
}
```

---

### ✅ Task 1.2: AdminSidebar Component

**File**: `src/components/AdminPanel/AdminSidebar.jsx`

```jsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import './AdminSidebar.css';

const navigationItems = {
  'super-admin': [
    { path: '/admin', icon: '📊', label: 'Dashboard', key: 'dashboard' },
    { path: '/admin/users', icon: '👥', label: 'Users', key: 'users' },
    { path: '/admin/pharmacies', icon: '🏥', label: 'Pharmacies', key: 'pharmacies' },
    { path: '/admin/analytics', icon: '📈', label: 'Analytics', key: 'analytics' },
    { path: '/admin/reports', icon: '📄', label: 'Reports', key: 'reports' },
    { path: '/admin/system', icon: '⚙️', label: 'System', key: 'system' },
  ],
  'pharmacy-admin': [
    { path: '/admin/my-analytics', icon: '📊', label: 'My Analytics', key: 'analytics' },
    { path: '/admin/orders', icon: '📋', label: 'Orders', key: 'orders' },
    { path: '/admin/inventory', icon: '📦', label: 'Inventory', key: 'inventory' },
    { path: '/admin/staff', icon: '👔', label: 'Staff', key: 'staff' },
  ],
  'analyst': [
    { path: '/admin/analytics', icon: '📈', label: 'Analytics', key: 'analytics' },
    { path: '/admin/reports', icon: '📄', label: 'Reports', key: 'reports' },
  ],
};

export default function AdminSidebar({ isOpen }) {
  const { user } = useAuth();
  const location = useLocation();

  const items = navigationItems[user?.role] || navigationItems['analyst'];

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">🏥 MediNear Admin</h2>
      </div>

      <nav className="sidebar-nav">
        {items.map(item => (
          <Link
            key={item.key}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="user-role">Role: {user?.role}</p>
      </div>
    </aside>
  );
}
```

---

### ✅ Task 1.3: AdminDashboard Main Component

**File**: `src/pages/AdminDashboard.jsx`

```jsx
import { useState, useEffect } from 'react';
import MetricsCard from '../components/AdminPanel/MetricsCard';
import SystemStatus from '../components/AdminPanel/SystemStatus';
import QuickActions from '../components/AdminPanel/QuickActions';
import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    fetchDashboardMetrics();
  }, [dateRange]);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/metrics?range=${dateRange}`);
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="date-range-selector">
          <button 
            className={`range-btn ${dateRange === '7d' ? 'active' : ''}`}
            onClick={() => setDateRange('7d')}
          >
            7 Days
          </button>
          <button 
            className={`range-btn ${dateRange === '30d' ? 'active' : ''}`}
            onClick={() => setDateRange('30d')}
          >
            30 Days
          </button>
          <button 
            className={`range-btn ${dateRange === '90d' ? 'active' : ''}`}
            onClick={() => setDateRange('90d')}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Key Metrics Section */}
      <section className="metrics-section">
        <h2>Key Metrics</h2>
        <div className="metrics-grid">
          <MetricsCard
            title="Total Users"
            value={metrics?.totalUsers || 0}
            trend="+12%"
            trendDirection="up"
            icon="👥"
          />
          <MetricsCard
            title="Total Pharmacies"
            value={metrics?.totalPharmacies || 0}
            trend="+8%"
            trendDirection="up"
            icon="🏥"
          />
          <MetricsCard
            title="Today's Revenue"
            value={`$${metrics?.todayRevenue || 0}`}
            trend="+25%"
            trendDirection="up"
            icon="💰"
          />
          <MetricsCard
            title="Active Orders"
            value={metrics?.activeOrders || 0}
            trend="-5%"
            trendDirection="down"
            icon="📦"
          />
        </div>
      </section>

      {/* System Status Section */}
      <section className="system-status-section">
        <SystemStatus />
      </section>

      {/* Quick Actions Section */}
      <section className="quick-actions-section">
        <QuickActions />
      </section>
    </div>
  );
}
```

---

### ✅ Task 1.4: MetricsCard Component with Modern UI

**File**: `src/components/AdminPanel/MetricsCard.jsx`

```jsx
import './MetricsCard.css';

export default function MetricsCard({ 
  title, 
  value, 
  trend, 
  trendDirection, 
  icon,
  onClick 
}) {
  return (
    <div className="metrics-card" onClick={onClick}>
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        <span className="card-icon">{icon}</span>
      </div>

      <div className="card-body">
        <div className="card-value">{value}</div>
        
        {trend && (
          <div className={`card-trend trend-${trendDirection}`}>
            <span className="trend-icon">
              {trendDirection === 'up' ? '📈' : '📉'}
            </span>
            <span className="trend-text">{trend}</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <p className="card-subtitle">Last 7 days</p>
      </div>
    </div>
  );
}
```

**Styles**: `src/components/AdminPanel/MetricsCard.css`

```css
.metrics-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.metrics-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 48px rgba(102, 126, 234, 0.15);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-color: rgba(102, 126, 234, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.card-icon {
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-body {
  margin-bottom: 16px;
}

.card-value {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-trend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
}

.trend-up {
  color: #51cf66;
}

.trend-down {
  color: #ff6b6b;
}

.trend-icon {
  font-size: 16px;
}

.card-footer {
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.card-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}
```

---

### ✅ Task 1.5: SystemStatus Component

**File**: `src/components/AdminPanel/SystemStatus.jsx`

```jsx
import { useState, useEffect } from 'react';
import './SystemStatus.css';

export default function SystemStatus() {
  const [systemStatus, setSystemStatus] = useState(null);
  const [refreshTime, setRefreshTime] = useState(new Date());

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await fetch('/api/admin/system-status');
        const data = await response.json();
        setSystemStatus(data);
        setRefreshTime(new Date());
      } catch (error) {
        console.error('Failed to fetch system status:', error);
      }
    };

    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    if (status === 'healthy') return '#51cf66';
    if (status === 'warning') return '#ffd43b';
    return '#ff6b6b';
  };

  const getStatusLabel = (status) => {
    if (status === 'healthy') return '✓ Healthy';
    if (status === 'warning') return '⚠ Warning';
    return '✗ Critical';
  };

  if (!systemStatus) return <div className="status-loading">Loading system status...</div>;

  return (
    <div className="system-status-container">
      <div className="status-header">
        <h2>System Status</h2>
        <p className="last-update">Last updated: {refreshTime.toLocaleTimeString()}</p>
      </div>

      <div className="status-grid">
        <StatusItem
          title="API Server"
          status={systemStatus.apiServer}
          details={`Response time: ${systemStatus.apiResponseTime}ms`}
        />
        <StatusItem
          title="Database"
          status={systemStatus.database}
          details={`Connections: ${systemStatus.dbConnections}`}
        />
        <StatusItem
          title="Cache (Redis)"
          status={systemStatus.cache}
          details={`Hit rate: ${systemStatus.cacheHitRate}%`}
        />
        <StatusItem
          title="File Storage"
          status={systemStatus.storage}
          details={`Usage: ${systemStatus.storageUsage}%`}
        />
      </div>

      <div className="status-alerts">
        {systemStatus.alerts && systemStatus.alerts.length > 0 && (
          <div className="alerts-list">
            <h3>⚠️ Active Alerts</h3>
            {systemStatus.alerts.map((alert, idx) => (
              <div key={idx} className="alert-item">
                <span className="alert-message">{alert.message}</span>
                <span className="alert-time">{alert.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusItem({ title, status, details }) {
  const statusColor = status === 'healthy' ? '#51cf66' : status === 'warning' ? '#ffd43b' : '#ff6b6b';
  const statusLabel = status === 'healthy' ? 'Healthy' : status === 'warning' ? 'Warning' : 'Critical';

  return (
    <div className="status-item">
      <div className="status-header-item">
        <h3>{title}</h3>
        <div className="status-indicator" style={{ backgroundColor: statusColor }}></div>
      </div>
      <p className="status-label">{statusLabel}</p>
      <p className="status-details">{details}</p>
    </div>
  );
}
```

---

### ✅ Task 1.6: AdminDashboard.css (Modern Styling)

**File**: `src/styles/AdminDashboard.css`

```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --success-gradient: linear-gradient(135deg, #51cf66 0%, #37b24d 100%);
  --warning-gradient: linear-gradient(135deg, #ffd43b 0%, #fab005 100%);
  --danger-gradient: linear-gradient(135deg, #ff6b6b 0%, #fa5252 100%);
  --info-gradient: linear-gradient(135deg, #4dabf7 0%, #228be6 100%);
  --smooth-ease: cubic-bezier(0.4, 0, 0.2, 1);
}

.admin-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
  color: #ffffff;
}

.admin-main {
  flex: 1;
  margin-left: 280px;
  padding: 24px;
  transition: margin-left 0.3s var(--smooth-ease);
  overflow-y: auto;
}

.admin-main.sidebar-closed {
  margin-left: 80px;
}

.admin-content {
  max-width: 1400px;
  margin: 0 auto;
}

/* Dashboard Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  animation: fadeInDown 0.4s var(--smooth-ease);
}

.dashboard-header h1 {
  font-size: 32px;
  font-weight: 800;
  margin: 0;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.date-range-selector {
  display: flex;
  gap: 12px;
}

.range-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s var(--smooth-ease);
}

.range-btn:hover,
.range-btn.active {
  background: var(--primary-gradient);
  border-color: transparent;
  color: white;
  transform: translateY(-2px);
}

/* Metrics Section */
.metrics-section,
.system-status-section,
.quick-actions-section {
  margin-bottom: 40px;
  animation: fadeInUp 0.5s var(--smooth-ease);
}

.metrics-section h2,
.system-status-section h2,
.quick-actions-section h2 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.9);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

/* Animations */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .admin-main {
    margin-left: 0;
    padding: 16px;
  }

  .admin-main.sidebar-closed {
    margin-left: 0;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .date-range-selector {
    width: 100%;
    justify-content: space-between;
  }
}
```

---

## MONTH 2: Analytics Components

### ✅ Task 2.1: Chart Components Library

**File**: `src/components/Analytics/Charts/LineChart.jsx`

```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Chart.css';

export default function MedicineChart({ data, title, dataKey, color = '#667eea' }) {
  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
          <YAxis stroke="rgba(255,255,255,0.7)" />
          <Tooltip 
            contentStyle={{
              background: 'rgba(15, 15, 30, 0.9)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            dot={false}
            strokeWidth={2}
            isAnimationActive
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**File**: `src/components/Analytics/Charts/BarChart.jsx`

```jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Chart.css';

export default function MedicineBarChart({ data, title, dataKey, color = '#667eea' }) {
  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
          <YAxis stroke="rgba(255,255,255,0.7)" />
          <Tooltip 
            contentStyle={{
              background: 'rgba(15, 15, 30, 0.9)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar 
            dataKey={dataKey} 
            fill={color}
            radius={[8, 8, 0, 0]}
            isAnimationActive
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**File**: `src/components/Analytics/Charts/Chart.css`

```css
.chart-container {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.chart-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### ✅ Task 2.2: User Analytics Dashboard

**File**: `src/pages/AdminDashboard/UserAnalytics.jsx`

```jsx
import { useState, useEffect } from 'react';
import LineChart from '../../components/Analytics/Charts/LineChart';
import BarChart from '../../components/Analytics/Charts/BarChart';
import './Analytics.css';

export default function UserAnalytics() {
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [segmentationData, setSegmentationData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserAnalytics();
  }, []);

  const fetchUserAnalytics = async () => {
    try {
      const [growth, segment] = await Promise.all([
        fetch('/api/admin/analytics/user-growth').then(r => r.json()),
        fetch('/api/admin/analytics/user-segmentation').then(r => r.json()),
      ]);
      
      setUserGrowthData(growth);
      setSegmentationData(segment);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user analytics:', error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="analytics-page">
      <h1>User Analytics</h1>
      <p className="page-subtitle">Track user growth, segmentation, and engagement metrics</p>

      <LineChart 
        data={userGrowthData}
        title="User Growth Trend (30 days)"
        dataKey="users"
        color="#667eea"
      />

      <BarChart
        data={segmentationData}
        title="User Segmentation by City"
        dataKey="count"
        color="#51cf66"
      />
    </div>
  );
}
```

**File**: `src/pages/AdminDashboard/Analytics.css`

```css
.analytics-page {
  padding: 0;
}

.analytics-page h1 {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 32px;
}

.filter-section {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-btn.active,
.filter-btn:hover {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: transparent;
  color: white;
}

.export-btn {
  padding: 10px 20px;
  border-radius: 8px;
  background: linear-gradient(135deg, #51cf66, #37b24d);
  border: none;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: auto;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(81, 207, 102, 0.3);
}
```

---

## MONTH 3: Advanced Features

### ✅ Task 3.1: Real-Time Monitoring Dashboard

**File**: `src/pages/AdminDashboard/RealTimeMonitoring.jsx`

```jsx
import { useState, useEffect } from 'react';
import './RealTimeMonitoring.css';

export default function RealTimeMonitoring() {
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    ordersPerMinute: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
  });

  useEffect(() => {
    // WebSocket connection for real-time updates
    const ws = new WebSocket('ws://localhost:8000/admin/monitoring');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMetrics(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => ws.close();
  }, []);

  return (
    <div className="realtime-monitoring">
      <h1>Real-Time System Monitoring</h1>

      <div className="monitoring-grid">
        <div className="monitoring-card">
          <h3>Active Users</h3>
          <div className="monitoring-value">{metrics.activeUsers}</div>
          <div className="monitoring-indicator live"></div>
        </div>

        <div className="monitoring-card">
          <h3>Orders/Minute</h3>
          <div className="monitoring-value">{metrics.ordersPerMinute}</div>
          <div className="monitoring-chart"></div>
        </div>

        <div className="monitoring-card">
          <h3>Avg Response Time</h3>
          <div className="monitoring-value">{metrics.averageResponseTime}ms</div>
          <div className={`status-badge ${metrics.averageResponseTime < 200 ? 'healthy' : 'warning'}`}>
            {metrics.averageResponseTime < 200 ? '✓ Good' : '⚠ Slow'}
          </div>
        </div>

        <div className="monitoring-card">
          <h3>Cache Hit Rate</h3>
          <div className="monitoring-value">{metrics.cacheHitRate}%</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${metrics.cacheHitRate}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**File**: `src/pages/AdminDashboard/RealTimeMonitoring.css`

```css
.realtime-monitoring {
  padding: 0;
}

.realtime-monitoring h1 {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 32px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.monitoring-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.monitoring-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  animation: scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.monitoring-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmer 3s infinite;
}

.monitoring-card h3 {
  margin: 0 0 16px 0;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.monitoring-value {
  font-size: 40px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
}

.monitoring-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff6b6b;
  animation: pulse 2s ease-in-out infinite;
}

.monitoring-indicator.live {
  background: #51cf66;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  margin-top: 8px;
}

.status-badge.healthy {
  background: rgba(81, 207, 102, 0.2);
  color: #51cf66;
}

.status-badge.warning {
  background: rgba(255, 212, 59, 0.2);
  color: #ffd43b;
}

.status-badge.critical {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Backend API Endpoints Required

### Month 1 Endpoints
```
GET /api/admin/metrics?range=7d
GET /api/admin/system-status
POST /api/admin/quick-actions/:action
```

### Month 2 Endpoints
```
GET /api/admin/analytics/user-growth
GET /api/admin/analytics/user-segmentation
GET /api/admin/analytics/pharmacy-performance
GET /api/admin/analytics/medicine-trends
GET /api/admin/analytics/order-stats
GET /api/admin/analytics/revenue-stats
```

### Month 3 Endpoints
```
GET /api/admin/analytics/demand-prediction
GET /api/admin/analytics/anomalies
GET /api/admin/analytics/compare
WS /admin/monitoring (WebSocket)
```

---

## Database Schema Updates Required

```javascript
// Create admin_logs collection
db.createCollection('admin_logs', {
  validator: {
    bsonType: 'object',
    required: ['action', 'adminId', 'timestamp'],
    properties: {
      _id: { bsonType: 'objectId' },
      action: { bsonType: 'string' },
      adminId: { bsonType: 'objectId' },
      details: { bsonType: 'object' },
      timestamp: { bsonType: 'date' }
    }
  }
});

db.admin_logs.createIndex({ adminId: 1, timestamp: -1 });
db.admin_logs.createIndex({ action: 1 });
```

---

## Quick Implementation Summary

| Phase | Components | Timeline | Priority |
|-------|-----------|----------|----------|
| Month 1 | 5 core components | Week 1-4 | P0 - Critical |
| Month 2 | 6 analytics dashboards | Week 1-4 | P0 - Critical |
| Month 3 | 4 advanced features | Week 1-4 | P1 - High |

---

**Status**: Ready for implementation
**Last Updated**: March 2026
**Next Checkpoint**: End of Month 1
