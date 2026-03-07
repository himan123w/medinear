import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import axios from 'axios';
import './AdminDashboard.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { showToast } = useToast?.() || {};
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [reservations, setReservations] = useState([]);
  
  const [userPage, setUserPage] = useState(1);
  const [pharmacyPage, setPharmacyPage] = useState(1);
  const [medicineCount, setMedicineCount] = useState(0);
  const [pharmacyCount, setPharmacyCount] = useState(0);
  const [reservationCount, setReservationCount] = useState(0);
  const [dashboardError, setDashboardError] = useState('');
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [usersPagination, setUsersPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [pharmaciesPagination, setPharmaciesPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  
  const [searchUser, setSearchUser] = useState('');
  const [searchMedicine, setSearchMedicine] = useState('');
  const [searchPharmacy, setSearchPharmacy] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddMedicineForm, setShowAddMedicineForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [selectedMedicineForStock, setSelectedMedicineForStock] = useState(null);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    genericName: '',
    strength: '',
    price: '',
    stock: '',
    stockAlert: '10',
    category: 'General',
    pharmacy: ''
  });
  const [stockUpdate, setStockUpdate] = useState({
    stock: '',
    stockAlert: ''
  });
  const [statsCache, setStatsCache] = useState(null);
  const [lastStatsTime, setLastStatsTime] = useState(null);

  const apiHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const extractPayload = useCallback((response) => {
    // Handle axios response structure
    if (response?.data?.data) return response.data.data;
    if (response?.data?.success === true && response?.data?.data) return response.data.data;
    // Fallback: return the data property directly if it exists
    if (response?.data) return response.data;
    return null;
  }, []);

  const extractListPayload = useCallback((payload, key) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.[key])) return payload[key];
    return [];
  }, []);

  const buildDateRangeParams = useCallback(() => {
    const params = {};
    if (dateRange.startDate) {
      params.startDate = dateRange.startDate;
    }
    if (dateRange.endDate) {
      params.endDate = dateRange.endDate;
    }
    return params;
  }, [dateRange]);

  const escapeCsvValue = useCallback((value) => {
    const raw = value === null || value === undefined ? '' : String(value);
    return `"${raw.replace(/"/g, '""')}"`;
  }, []);

  const downloadCsv = useCallback((filename, headers, rows) => {
    const csvLines = [headers.join(','), ...rows.map((row) => row.map(escapeCsvValue).join(','))];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [escapeCsvValue]);

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'users', label: 'Users', icon: '👥' },
    { key: 'medicines', label: 'Medicines', icon: '💊' },
    { key: 'pharmacies', label: 'Pharmacies', icon: '🏥' },
    { key: 'reservations', label: 'Reservations', icon: '📋' },
  ];

  const exportCurrentDataAsCsv = useCallback(() => {
    const now = new Date();
    const dateStamp = now.toISOString().slice(0, 10);
    const timeStamp = now.toTimeString().slice(0, 8).replace(/:/g, '-');
    const rangeSuffix = (dateRange.startDate || dateRange.endDate)
      ? `_${dateRange.startDate || 'start'}_to_${dateRange.endDate || 'end'}`
      : '';
    const buildFilename = (prefix) => `${prefix}${rangeSuffix}_${dateStamp}_${timeStamp}.csv`;

    if (activeTab === 'dashboard' && stats) {
      const headers = ['Metric', 'Value'];
      const rows = [
        ['Total Users', stats.totalUsers],
        ['Total Pharmacies', stats.totalPharmacies],
        ['Total Medicines', stats.totalMedicines],
        ['Low Stock Medicines', stats.lowStockMedicines ?? 0],
        ['Total Reservations', stats.totalReservations],
        ['Active Reservations', stats.activeReservations],
        ['Completed Reservations', stats.completedReservations],
        ['Cancelled Reservations', stats.cancelledReservations],
        ['Healthy Features', stats.featureHealth?.healthyFeatures ?? 0],
        ['Warning Features', stats.featureHealth?.warningFeatures ?? 0],
        ['Critical Features', stats.featureHealth?.criticalFeatures ?? 0],
        ['Overall Success Rate', `${stats.featureHealth?.overallSuccessRate ?? 0}%`]
      ];
      downloadCsv(buildFilename('admin-dashboard'), headers, rows);
      return;
    }

    if (activeTab === 'users') {
      const headers = ['Name', 'Email', 'Phone', 'Role', 'Created At'];
      const rows = users.map((item) => [
        item.name || '',
        item.email || '',
        item.phone || '',
        item.role || 'user',
        item.createdAt || ''
      ]);
      downloadCsv(buildFilename('admin-users'), headers, rows);
      return;
    }

    if (activeTab === 'medicines') {
      const headers = ['Name', 'Generic Name', 'Strength', 'Price', 'Stock', 'Stock Alert', 'Category'];
      const rows = medicines.map((item) => [
        item.name || '',
        item.genericName || '',
        item.strength || '',
        item.price || 0,
        item.stock || 0,
        item.stockAlert || 0,
        item.category || ''
      ]);
      downloadCsv(buildFilename('admin-medicines'), headers, rows);
      return;
    }

    if (activeTab === 'pharmacies') {
      const headers = ['Name', 'Location', 'Phone', 'Rating', 'Created At'];
      const rows = pharmacies.map((item) => [
        item.name || '',
        item.location?.city || item.location?.address || '',
        item.phone || '',
        item.rating || 0,
        item.createdAt || ''
      ]);
      downloadCsv(buildFilename('admin-pharmacies'), headers, rows);
      return;
    }

    if (activeTab === 'reservations') {
      const headers = ['Medicine', 'Pharmacy', 'User', 'Quantity', 'Status', 'Created At'];
      const rows = reservations.map((item) => [
        item.medicine?.name || item.medicineId?.name || '',
        item.pharmacy?.name || item.pharmacyId?.name || '',
        item.user?.name || item.userId?.name || '',
        item.quantity || 0,
        item.status || '',
        item.createdAt || ''
      ]);
      downloadCsv(buildFilename('admin-reservations'), headers, rows);
    }
  }, [activeTab, stats, users, medicines, pharmacies, reservations, downloadCsv, dateRange.startDate, dateRange.endDate]);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      showToast?.('Access denied: Admin privileges required', 'error');
      navigate('/');
    }
  }, [user, showToast, navigate]);

  // Fetch dashboard stats
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardStats({ force: false });
    }
  }, [activeTab, dateRange.startDate, dateRange.endDate]);

  // Auto refresh dashboard every 60 seconds while dashboard tab is active.
  useEffect(() => {
    if (activeTab !== 'dashboard') return undefined;

    const timer = setInterval(() => {
      fetchDashboardStats({ force: true, silent: true });
    }, 60000);

    return () => clearInterval(timer);
  }, [activeTab, dateRange.startDate, dateRange.endDate]);

  // Fetch users when tab changes
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, userPage, searchUser, dateRange.startDate, dateRange.endDate]);

  // Fetch medicines when tab changes
  useEffect(() => {
    if (activeTab === 'medicines') {
      fetchMedicines();
    }
  }, [activeTab, medicineCount, searchMedicine, dateRange.startDate, dateRange.endDate]);

  // Fetch pharmacies when tab changes
  useEffect(() => {
    if (activeTab === 'pharmacies') {
      fetchPharmacies();
    }
  }, [activeTab, pharmacyPage, pharmacyCount, searchPharmacy, dateRange.startDate, dateRange.endDate]);

  // Fetch reservations when tab changes
  useEffect(() => {
    if (activeTab === 'reservations') {
      fetchReservations();
    }
  }, [activeTab, filterStatus, reservationCount, dateRange.startDate, dateRange.endDate]);

  const fetchDashboardStats = async ({ force = false, silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
        setDashboardError('');
      }

      // Check if cache is still valid (30 seconds)
      const now = Date.now();
      if (!force && statsCache && lastStatsTime && (now - lastStatsTime) < 30000) {
        setStats(statsCache);
        if (!silent) {
          setLoading(false);
        }
        return;
      }

      const response = await axios.get(`${API_BASE}/admin/dashboard/stats`, {
        params: buildDateRangeParams(),
        headers: apiHeaders,
        timeout: 20000,
      });
      
      const payload = extractPayload(response);
      
      if (!payload) {
        throw new Error('Invalid response structure');
      }

      setStats(payload);
      setStatsCache(payload);
      setLastStatsTime(Date.now());
      setLastUpdatedAt(new Date());
    } catch (error) {
      const isTimeout = error?.code === 'ECONNABORTED' || error?.message?.toLowerCase?.().includes('timeout');

      if (statsCache) {
        // Use cached data if request fails
        setStats(statsCache);
        showToast?.(
          isTimeout ? 'Using cached data - dashboard request timed out' : 'Using cached data - network issue',
          'warning'
        );
      } else {
        setDashboardError(
          isTimeout
            ? 'Dashboard request timed out. Please click Refresh Data.'
            : `Failed to fetch dashboard stats: ${error?.message || 'Unknown error'}`
        );
        showToast?.('Failed to fetch dashboard stats. Check your internet connection.', 'error');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/admin/users`, {
        params: { page: userPage, limit: 10, search: searchUser, ...buildDateRangeParams() },
        headers: apiHeaders,
      });
      const payload = extractPayload(response);
      setUsers(extractListPayload(payload, 'users'));
      setUsersPagination(payload?.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      showToast?.('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/admin/medicines`, {
        params: { page: 1, limit: 10, search: searchMedicine, ...buildDateRangeParams() },
        headers: apiHeaders,
      });
      const payload = extractPayload(response);
      setMedicines(extractListPayload(payload, 'medicines'));
    } catch (error) {
      showToast?.('Failed to fetch medicines', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/admin/pharmacies`, {
        params: { page: pharmacyPage, limit: 50, search: searchPharmacy, ...buildDateRangeParams() },
        headers: apiHeaders,
      });
      const payload = extractPayload(response);
      setPharmacies(extractListPayload(payload, 'pharmacies'));
      setPharmaciesPagination(payload?.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      showToast?.('Failed to fetch pharmacies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/admin/reservations`, {
        params: {
          page: 1,
          limit: 10,
          status: filterStatus === 'all' ? '' : filterStatus,
          ...buildDateRangeParams()
        },
        headers: apiHeaders,
      });
      const payload = extractPayload(response);
      setReservations(extractListPayload(payload, 'reservations'));
    } catch (error) {
      showToast?.('Failed to fetch reservations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API_BASE}/admin/users/${userId}`, {
        headers: apiHeaders,
      });
      showToast?.('User deleted successfully', 'success');
      setUserPage(1);
      fetchUsers();
    } catch (error) {
      showToast?.('Failed to delete user', 'error');
    }
  };

  const deleteMedicine = async (medicineId) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    try {
      await axios.delete(`${API_BASE}/admin/medicines/${medicineId}`, {
        headers: apiHeaders,
      });
      showToast?.('Medicine deleted successfully', 'success');
      setMedicineCount(medicineCount + 1);
    } catch (error) {
      showToast?.('Failed to delete medicine', 'error');
    }
  };

  const deletePharmacy = async (pharmacyId) => {
    if (!window.confirm('Are you sure you want to delete this pharmacy?')) return;
    try {
      await axios.delete(`${API_BASE}/admin/pharmacies/${pharmacyId}`, {
        headers: apiHeaders,
      });
      showToast?.('Pharmacy deleted successfully', 'success');
      setPharmacyCount(pharmacyCount + 1);
    } catch (error) {
      showToast?.('Failed to delete pharmacy', 'error');
    }
  };

  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      await axios.put(
        `${API_BASE}/admin/reservations/${reservationId}/status`,
        { status: newStatus },
        { headers: apiHeaders }
      );
      showToast?.('Reservation status updated', 'success');
      setReservationCount(reservationCount + 1);
    } catch (error) {
      showToast?.('Failed to update reservation', 'error');
    }
  };
  const addMedicine = async (e) => {
    e.preventDefault();
    try {
      if (!newMedicine.name || !newMedicine.price || !newMedicine.pharmacy) {
        showToast?.('Please fill in all required fields', 'error');
        return;
      }

      await axios.post(
        `${API_BASE}/admin/medicines`,
        {
          ...newMedicine,
          price: parseFloat(newMedicine.price),
          stock: parseInt(newMedicine.stock) || 0,
          stockAlert: parseInt(newMedicine.stockAlert) || 10
        },
        { headers: apiHeaders }
      );
      showToast?.('Medicine added successfully', 'success');
      setNewMedicine({
        name: '',
        genericName: '',
        strength: '',
        price: '',
        stock: '',
        stockAlert: '10',
        category: 'General',
        pharmacy: ''
      });
      setShowAddMedicineForm(false);
      setMedicineCount(medicineCount + 1);
    } catch (error) {
      showToast?.('Failed to add medicine', 'error');
    }
  };

  const updateMedicineStock = async (e) => {
    e.preventDefault();
    if (!selectedMedicineForStock) return;
    
    try {
      if (!stockUpdate.stock && stockUpdate.stock !== 0 && !stockUpdate.stockAlert) {
        showToast?.('Please enter stock or stock alert value', 'error');
        return;
      }

      await axios.put(
        `${API_BASE}/admin/medicines/${selectedMedicineForStock._id}/stock`,
        {
          stock: stockUpdate.stock !== '' ? parseInt(stockUpdate.stock) : undefined,
          stockAlert: stockUpdate.stockAlert ? parseInt(stockUpdate.stockAlert) : undefined
        },
        { headers: apiHeaders }
      );
      showToast?.('Medicine stock updated successfully', 'success');
      setShowStockForm(false);
      setSelectedMedicineForStock(null);
      setStockUpdate({ stock: '', stockAlert: '' });
      setMedicineCount(medicineCount + 1);
    } catch (error) {
      showToast?.('Failed to update medicine stock', 'error');
    }
  };

  const openTab = (tabKey) => {
    setActiveTab(tabKey);
  };

  const resetDateRange = () => {
    setDateRange({ startDate: '', endDate: '' });
  };

  const reservationCompletionRate = useMemo(() => {
    if (!stats?.totalReservations) return 0;
    return Number(((stats.completedReservations / stats.totalReservations) * 100).toFixed(1));
  }, [stats]);

  const startupReadinessScore = useMemo(() => {
    const featureScore = stats?.featureHealth?.overallSuccessRate ?? 0;
    const reservationScore = reservationCompletionRate;
    const cancellationPenalty = stats?.totalReservations
      ? Number(((stats.cancelledReservations / stats.totalReservations) * 100).toFixed(1))
      : 0;
    const weighted = (featureScore * 0.6) + (reservationScore * 0.5) - (cancellationPenalty * 0.1);
    return Math.max(0, Math.min(100, Number(weighted.toFixed(1))));
  }, [stats, reservationCompletionRate]);

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-top">
          <h1>🛡️ Admin Dashboard</h1>
          <p>Welcome back, {user?.name || 'Admin'}. Manage operations with a faster, cleaner workflow.</p>
        </div>
        <div className="admin-quick-actions">
          <button className="quick-action-card" onClick={() => openTab('users')}>
            <span className="quick-action-icon">👥</span>
            <span className="quick-action-content">
              <strong>{stats?.totalUsers ?? '--'}</strong>
              <small>Total users</small>
            </span>
          </button>
          <button className="quick-action-card" onClick={() => openTab('medicines')}>
            <span className="quick-action-icon">💊</span>
            <span className="quick-action-content">
              <strong>{stats?.totalMedicines ?? '--'}</strong>
              <small>Medicines</small>
            </span>
          </button>
          <button className="quick-action-card" onClick={() => openTab('pharmacies')}>
            <span className="quick-action-icon">🏥</span>
            <span className="quick-action-content">
              <strong>{stats?.totalPharmacies ?? '--'}</strong>
              <small>Pharmacies</small>
            </span>
          </button>
          <button className="quick-action-card" onClick={() => openTab('reservations')}>
            <span className="quick-action-icon">📋</span>
            <span className="quick-action-content">
              <strong>{stats?.totalReservations ?? '--'}</strong>
              <small>Reservations</small>
            </span>
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => openTab(tab.key)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="admin-content">
        <div className="admin-tools-row">
          <div className="date-range-tools">
            <label>
              Start Date
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </label>
            <label>
              End Date
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
              />
            </label>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => fetchDashboardStats({ force: true })}
            >
              Apply Range
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={resetDateRange}
            >
              Reset Range
            </button>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={exportCurrentDataAsCsv}
          >
            Export {tabs.find((tab) => tab.key === activeTab)?.label || 'Data'} CSV
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <div className="dashboard-title-row">
              <h2>Dashboard Statistics</h2>
              <button
                className="btn-secondary dashboard-refresh-btn"
                onClick={() => fetchDashboardStats({ force: true })}
                type="button"
              >
                Refresh Data
              </button>
            </div>
            <div className="dashboard-meta-row">
              <span className="meta-pill">Auto-refresh: every 60s</span>
              <span className="meta-pill">Last update: {lastUpdatedAt ? lastUpdatedAt.toLocaleTimeString() : 'N/A'}</span>
              <span className="meta-pill score">Startup Readiness Score: {startupReadinessScore}%</span>
            </div>
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading statistics...</p>
              </div>
            ) : stats ? (
              <>
                <div className="startup-kpi-grid">
                  <div className="startup-kpi-card">
                    <p>Reservation Completion Rate</p>
                    <strong>{reservationCompletionRate}%</strong>
                  </div>
                  <div className="startup-kpi-card">
                    <p>Feature Reliability</p>
                    <strong>{stats.featureHealth?.overallSuccessRate ?? 0}%</strong>
                  </div>
                  <div className="startup-kpi-card">
                    <p>Critical Features</p>
                    <strong>{stats.featureHealth?.criticalFeatures ?? 0}</strong>
                  </div>
                </div>

                {stats.criticalAlerts?.length > 0 && (
                  <div className="critical-alerts-widget">
                    <h3>Critical Alerts</h3>
                    <div className="alerts-list">
                      {stats.criticalAlerts.map((alertItem, index) => (
                        <div key={`${alertItem.title}-${index}`} className={`alert-card ${alertItem.severity}`}>
                          <div>
                            <strong>{alertItem.title}</strong>
                            <p>{alertItem.message}</p>
                          </div>
                          <small>{alertItem.action}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-details">
                      <div className="stat-label">Total Users</div>
                      <div className="stat-value">{stats.totalUsers}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🏥</div>
                    <div className="stat-details">
                      <div className="stat-label">Total Pharmacies</div>
                      <div className="stat-value">{stats.totalPharmacies}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">💊</div>
                    <div className="stat-details">
                      <div className="stat-label">Total Medicines</div>
                      <div className="stat-value">{stats.totalMedicines}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-details">
                      <div className="stat-label">Total Reservations</div>
                      <div className="stat-value">{stats.totalReservations}</div>
                    </div>
                  </div>
                  <div className="stat-card highlight">
                    <div className="stat-icon">✅</div>
                    <div className="stat-details">
                      <div className="stat-label">Active Reservations</div>
                      <div className="stat-value">{stats.activeReservations}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🎉</div>
                    <div className="stat-details">
                      <div className="stat-label">Completed Reservations</div>
                      <div className="stat-value">{stats.completedReservations}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">❌</div>
                    <div className="stat-details">
                      <div className="stat-label">Cancelled Reservations</div>
                      <div className="stat-value">{stats.cancelledReservations}</div>
                    </div>
                  </div>
                  <div className="stat-card highlight">
                    <div className="stat-icon">🟢</div>
                    <div className="stat-details">
                      <div className="stat-label">Healthy Features</div>
                      <div className="stat-value">{stats.featureHealth?.healthyFeatures ?? 0}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🟡</div>
                    <div className="stat-details">
                      <div className="stat-label">Warning Features</div>
                      <div className="stat-value">{stats.featureHealth?.warningFeatures ?? 0}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🔴</div>
                    <div className="stat-details">
                      <div className="stat-label">Critical Features</div>
                      <div className="stat-value">{stats.featureHealth?.criticalFeatures ?? 0}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-details">
                      <div className="stat-label">Overall Success Rate</div>
                      <div className="stat-value">{stats.featureHealth?.overallSuccessRate ?? 0}%</div>
                    </div>
                  </div>
                </div>

                <div className="feature-health-panel">
                  <div className="feature-health-header">
                    <h3>Feature Health Tracker</h3>
                    <p>
                      Tracked: {stats.featureHealth?.trackedFeatures ?? 0} | Unknown:{' '}
                      {stats.featureHealth?.unknownFeatures ?? 0}
                    </p>
                  </div>

                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Feature</th>
                          <th>Status</th>
                          <th>Success Rate</th>
                          <th>API Hits</th>
                          <th>Avg Response</th>
                          <th>Last Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.featureHealth?.features?.length ? (
                          stats.featureHealth.features.map((feature) => (
                            <tr key={feature.featureKey}>
                              <td>{feature.featureName}</td>
                              <td>
                                <span className={`badge feature-status ${feature.status}`}>
                                  {feature.status}
                                </span>
                              </td>
                              <td>{feature.totalHits > 0 ? `${feature.successRate}%` : 'N/A'}</td>
                              <td>{feature.totalHits}</td>
                              <td>{feature.totalHits > 0 ? `${feature.averageResponseTimeMs}ms` : 'N/A'}</td>
                              <td>{feature.lastStatusCode ?? 'N/A'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="empty">No feature tracking data yet</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="error">
                {dashboardError || 'Failed to load stats'}
                <button
                  type="button"
                  className="btn-secondary retry-btn"
                  onClick={() => fetchDashboardStats({ force: true })}
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="tab-content">
            <h2>Manage Users</h2>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchUser}
                onChange={(e) => {
                  setSearchUser(e.target.value);
                  setUserPage(1);
                }}
              />
            </div>
            {loading ? (
              <div className="loading">Loading users...</div>
            ) : (
              <>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? (
                        users.map((u) => (
                          <tr key={u._id}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>{u.phone}</td>
                            <td><span className="badge">{u.role || 'user'}</span></td>
                            <td>
                              <button
                                className="btn-danger"
                                onClick={() => deleteUser(u._id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="5" className="empty">No users found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="pagination-row">
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={userPage <= 1}
                    onClick={() => setUserPage((prev) => Math.max(1, prev - 1))}
                  >
                    Previous
                  </button>
                  <span>
                    Page {usersPagination.page || userPage} of {usersPagination.pages || 1} | Total Users: {usersPagination.total || 0}
                  </span>
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={userPage >= (usersPagination.pages || 1)}
                    onClick={() => setUserPage((prev) => Math.min(usersPagination.pages || 1, prev + 1))}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Medicines Tab */}
        {activeTab === 'medicines' && (
          <div className="tab-content">
            <div className="section-header-row">
              <h2>Manage Medicines & Stock</h2>
              <button 
                onClick={() => setShowAddMedicineForm(!showAddMedicineForm)}
                className="btn-primary add-medicine-btn"
              >
                {showAddMedicineForm ? '✕ Cancel' : '+ Add Medicine'}
              </button>
            </div>

            {/* Add Medicine Form */}
            {showAddMedicineForm && (
              <div className="form-container medicine-form-card">
                <h3>Add New Medicine</h3>
                <form onSubmit={addMedicine}>
                  <div className="medicine-form-grid">
                    <div>
                      <label>Medicine Name *</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Paracetamol"
                        value={newMedicine.name}
                        onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label>Generic Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Acetaminophen"
                        value={newMedicine.genericName}
                        onChange={(e) => setNewMedicine({...newMedicine, genericName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label>Strength</label>
                      <input 
                        type="text" 
                        placeholder="e.g., 500mg"
                        value={newMedicine.strength}
                        onChange={(e) => setNewMedicine({...newMedicine, strength: e.target.value})}
                      />
                    </div>
                    <div>
                      <label>Price (₹) *</label>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        value={newMedicine.price}
                        onChange={(e) => setNewMedicine({...newMedicine, price: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label>Initial Stock</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={newMedicine.stock}
                        onChange={(e) => setNewMedicine({...newMedicine, stock: e.target.value})}
                      />
                    </div>
                    <div>
                      <label>Stock Alert Level</label>
                      <input 
                        type="number" 
                        placeholder="10"
                        value={newMedicine.stockAlert}
                        onChange={(e) => setNewMedicine({...newMedicine, stockAlert: e.target.value})}
                      />
                    </div>
                    <div>
                      <label>Category</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Painkillers"
                        value={newMedicine.category}
                        onChange={(e) => setNewMedicine({...newMedicine, category: e.target.value})}
                      />
                    </div>
                    <div>
                      <label>Pharmacy ID *</label>
                      <input 
                        type="text" 
                        placeholder="Pharmacy ObjectId"
                        value={newMedicine.pharmacy}
                        onChange={(e) => setNewMedicine({...newMedicine, pharmacy: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-success full-width-btn">
                    Add Medicine
                  </button>
                </form>
              </div>
            )}

            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by medicine name..."
                value={searchMedicine}
                onChange={(e) => setSearchMedicine(e.target.value)}
              />
            </div>
            {loading ? (
              <div className="loading">Loading medicines...</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Generic Name</th>
                      <th>Strength</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Alert Level</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.length > 0 ? (
                      medicines.map((m) => (
                        <tr key={m._id} style={{ backgroundColor: m.stock < m.stockAlert ? '#fff3cd' : 'transparent' }}>
                          <td>{m.name}</td>
                          <td>{m.genericName || '-'}</td>
                          <td>{m.strength || '-'}</td>
                          <td>₹{m.price}</td>
                          <td><strong>{m.stock || 0}</strong></td>
                          <td>{m.stockAlert || 10}</td>
                          <td style={{ minWidth: '200px' }}>
                            <button
                              className="btn-info"
                              onClick={() => {
                                setSelectedMedicineForStock(m);
                                setStockUpdate({ stock: m.stock || '', stockAlert: m.stockAlert || '' });
                                setShowStockForm(true);
                              }}
                              style={{ marginRight: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            >
                              📦 Update Stock
                            </button>
                            <button
                              className="btn-danger"
                              onClick={() => deleteMedicine(m._id)}
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="7" className="empty">No medicines found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Stock Update Modal */}
            {showStockForm && selectedMedicineForStock && (
              <div className="modal-overlay" onClick={() => setShowStockForm(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h3>Update Stock - {selectedMedicineForStock.name}</h3>
                  <form onSubmit={updateMedicineStock}>
                    <div>
                      <label>Current Stock</label>
                      <input 
                        type="number" 
                        placeholder="Current stock"
                        value={stockUpdate.stock}
                        onChange={(e) => setStockUpdate({...stockUpdate, stock: e.target.value})}
                      />
                    </div>
                    <div>
                      <label>Stock Alert Level</label>
                      <input 
                        type="number" 
                        placeholder="Alert level"
                        value={stockUpdate.stockAlert}
                        onChange={(e) => setStockUpdate({...stockUpdate, stockAlert: e.target.value})}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                      <button type="submit" className="btn-success" style={{ flex: 1 }}>
                        Save Stock
                      </button>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        onClick={() => setShowStockForm(false)}
                        style={{ flex: 1 }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pharmacies Tab */}
        {activeTab === 'pharmacies' && (
          <div className="tab-content">
            <h2>Manage Pharmacies</h2>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by pharmacy name..."
                value={searchPharmacy}
                onChange={(e) => setSearchPharmacy(e.target.value)}
              />
            </div>
            {loading ? (
              <div className="loading">Loading pharmacies...</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Address</th>
                      <th>Area</th>
                      <th>Phone</th>
                      <th>Location</th>
                      <th>Open 24x7</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pharmacies.length > 0 ? (
                      pharmacies.map((p) => (
                        <tr key={p._id}>
                          <td>{p.name}</td>
                          <td>{p.address || 'N/A'}</td>
                          <td>{p.area || p.city || 'N/A'}</td>
                          <td>{p.phone}</td>
                          <td>
                            {p.latitude && p.longitude 
                              ? `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}`
                              : 'No coordinates'}
                          </td>
                          <td>{p.open24x7 ? '✅ Yes' : '❌ No'}</td>
                          <td>
                            <button
                              className="btn-danger"
                              onClick={() => deletePharmacy(p._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="7" className="empty">No pharmacies found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <div className="pagination-row">
              <button
                className="btn-secondary"
                disabled={pharmacyPage <= 1}
                onClick={() => setPharmacyPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pharmaciesPagination.page || pharmacyPage} of {pharmaciesPagination.pages || 1} | Total Pharmacies: {pharmaciesPagination.total || pharmacies.length}
              </span>
              <button
                className="btn-secondary"
                disabled={pharmacyPage >= (pharmaciesPagination.pages || 1)}
                onClick={() => setPharmacyPage((prev) => Math.min(pharmaciesPagination.pages || 1, prev + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div className="tab-content">
            <h2>Manage Reservations</h2>
            <div className="filter-bar">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            {loading ? (
              <div className="loading">Loading reservations...</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Pharmacy</th>
                      <th>User</th>
                      <th>Quantity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.length > 0 ? (
                      reservations.map((r) => (
                        <tr key={r._id}>
                              <td>{r.medicine?.name || r.medicineId?.name || '-'}</td>
                              <td>{r.pharmacy?.name || r.pharmacyId?.name || '-'}</td>
                              <td>{r.user?.name || r.userId?.name || '-'}</td>
                          <td>{r.quantity}</td>
                          <td>
                            <span className={`status-badge status-${r.status}`}>
                              {r.status}
                            </span>
                          </td>
                          <td>
                            <select
                              onChange={(e) => updateReservationStatus(r._id, e.target.value)}
                              value={r.status}
                              className="status-select"
                            >
                              <option value="active">Active</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="6" className="empty">No reservations found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
