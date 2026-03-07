import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicineAPI } from '../api';
import { useAuth } from '../AuthContext';
import HeatmapPreviewCard from '../components/HeatmapPreviewCard';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingStock, setEditingStock] = useState(null);
  const [notification, setNotification] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    available: true,
    category: 'Other',
    stock: 0,
    stockAlert: 10,
    pharmacy: user?._id || '',
  });
  const [stockModalData, setStockModalData] = useState({
    medicineId: null,
    medicineName: '',
    quantity: '',
    operation: 'set',
  });

  const categories = ['Antibiotics', 'Pain Relief', 'Cold & Flu', 'Vitamins', 'Digestive', 'Skin Care', 'Other'];

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadMedicines();
  }, [token, navigate]);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const response = await medicineAPI.getMyMedicines();
      setMedicines(response.data);
    } catch (error) {
      showNotification('Error loading medicines: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg, type = 'info') => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      showNotification('Please fill in all fields', 'warning');
      return;
    }

    try {
      const submitData = {
        ...formData,
        pharmacy: user._id, // Ensure pharmacy is always included
      };

      if (editingId) {
        await medicineAPI.updateMedicine(editingId, submitData);
        showNotification('Medicine updated successfully', 'success');
      } else {
        await medicineAPI.addMedicine(submitData);
        showNotification('Medicine added successfully', 'success');
      }
      resetForm();
      loadMedicines();
    } catch (error) {
      showNotification('Error: ' + error.response?.data?.message || error.message, 'error');
    }
  };

  const handleEdit = (medicine) => {
    setFormData({
      name: medicine.name,
      price: medicine.price,
      available: medicine.available,
      category: medicine.category || 'Other',
      stock: medicine.stock || 0,
      stockAlert: medicine.stockAlert || 10,
      pharmacy: user._id, // Ensure pharmacy is set for updates
    });
    setEditingId(medicine._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await medicineAPI.deleteMedicine(id);
        showNotification('Medicine deleted successfully', 'success');
        loadMedicines();
      } catch (error) {
        showNotification('Error deleting medicine: ' + error.message, 'error');
      }
    }
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    
    if (!stockModalData.quantity || stockModalData.quantity < 0) {
      showNotification('Please enter a valid quantity', 'warning');
      return;
    }

    try {
      await medicineAPI.updateStock(
        stockModalData.medicineId,
        parseInt(stockModalData.quantity),
        stockModalData.operation
      );
      showNotification('Stock updated successfully', 'success');
      closeStockModal();
      loadMedicines();
    } catch (error) {
      showNotification('Error updating stock: ' + error.message, 'error');
    }
  };

  const handleMarkOutOfStock = async (medicineId) => {
    if (window.confirm('Mark this medicine as out of stock?')) {
      try {
        await medicineAPI.markOutOfStock(medicineId);
        showNotification('Medicine marked as out of stock', 'success');
        loadMedicines();
      } catch (error) {
        showNotification('Error: ' + error.message, 'error');
      }
    }
  };

  const handleRestock = async (medicineId, currentName) => {
    const quantity = prompt(`Enter new stock quantity for ${currentName}:`);
    
    if (quantity !== null && quantity > 0) {
      try {
        await medicineAPI.restockMedicine(medicineId, parseInt(quantity));
        showNotification('Medicine restocked successfully', 'success');
        loadMedicines();
      } catch (error) {
        showNotification('Error restocking: ' + error.message, 'error');
      }
    }
  };

  const openStockModal = (medicine) => {
    setEditingStock(medicine._id);
    setStockModalData({
      medicineId: medicine._id,
      medicineName: medicine.name,
      quantity: '',
      operation: 'set',
    });
  };

  const closeStockModal = () => {
    setEditingStock(null);
    setStockModalData({
      medicineId: null,
      medicineName: '',
      quantity: '',
      operation: 'set',
    });
  };

  const getStockStatus = (medicine) => {
    if (medicine.stock === 0) return { status: 'out_of_stock', label: '❌ Out', color: '#ff6b6b' };
    if (medicine.stock < (medicine.stockAlert || 10)) return { status: 'low_stock', label: '⚠️ Low', color: '#ffa94d' };
    return { status: 'good', label: '✅ Good', color: '#51cf66' };
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      available: true,
      category: 'Other',
      stock: 0,
      stockAlert: 10,
      pharmacy: user?._id || '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!token) {
    return null;
  }

  return (
    <div className="dashboard-container">
      {notification && (
        <div className={`notification ${notification.includes('Error') ? 'error' : notification.includes('success') ? 'success' : 'info'}`}>
          {notification}
        </div>
      )}

      <header className="dashboard-header">
        <div className="header-top">
          <div className="header-content">
            <h1>💊 Pharmacy Dashboard</h1>
            <p>Welcome, {user?.name || 'User'}! Manage your medicines and stock efficiently.</p>
          </div>
          <div className="header-actions">
            <button onClick={() => navigate('/ai/insights')} className="btn btn-primary">
              🤖 AI Insights
            </button>
            <button onClick={() => navigate('/delivery')} className="btn btn-success">
              🚚 Delivery
            </button>
            <button onClick={() => navigate('/prescriptions')} className="btn btn-secondary">
              📋 Prescriptions
            </button>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
        <div className="dashboard-quick-stats">
          <div className="quick-stat-card">
            <span className="quick-stat-icon">💊</span>
            <div className="quick-stat-content">
              <strong>{medicines.length}</strong>
              <small>Total Medicines</small>
            </div>
          </div>
          <div className="quick-stat-card">
            <span className="quick-stat-icon">✅</span>
            <div className="quick-stat-content">
              <strong>{medicines.filter(m => m.available && m.stock > 0).length}</strong>
              <small>In Stock</small>
            </div>
          </div>
          <div className="quick-stat-card">
            <span className="quick-stat-icon">⚠️</span>
            <div className="quick-stat-content">
              <strong>{medicines.filter(m => m.stock > 0 && m.stock < (m.stockAlert || 10)).length}</strong>
              <small>Low Stock</small>
            </div>
          </div>
          <div className="quick-stat-card">
            <span className="quick-stat-icon">❌</span>
            <div className="quick-stat-content">
              <strong>{medicines.filter(m => !m.available || m.stock === 0).length}</strong>
              <small>Out of Stock</small>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{medicines.length}</h3>
          <p>Total Medicines</p>
        </div>
        <div className="stat-card">
          <h3>{medicines.filter(m => m.available && m.stock > 0).length}</h3>
          <p>In Stock</p>
        </div>
        <div className="stat-card">
          <h3>{medicines.filter(m => !m.available || m.stock === 0).length}</h3>
          <p>Out of Stock</p>
        </div>
        <div className="stat-card">
          <h3>{medicines.filter(m => m.stock > 0 && m.stock < (m.stockAlert || 10)).length}</h3>
          <p>Low Stock</p>
        </div>
      </div>

      <div className="dashboard-heatmap-preview">
        <HeatmapPreviewCard compact={true} />
      </div>

      <div className="dashboard-content">
        <div className="medicines-section">
          <div className="section-header">
            <h2>Medicines</h2>
            <button 
              onClick={() => setShowForm(!showForm)} 
              className="btn btn-primary"
            >
              {showForm ? 'Cancel' : '+ Add Medicine'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="medicine-form">
              <h3>{editingId ? 'Edit' : 'Add'} Medicine</h3>
              
              <div className="form-group">
                <label htmlFor="name">Medicine Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Aspirin"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price (₹)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="stock">Initial Stock Quantity</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="stockAlert">Low Stock Alert (units)</label>
                <input
                  type="number"
                  id="stockAlert"
                  name="stockAlert"
                  value={formData.stockAlert}
                  onChange={handleChange}
                  placeholder="10"
                  min="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="available">
                  <input
                    type="checkbox"
                    id="available"
                    name="available"
                    checked={formData.available}
                    onChange={handleChange}
                  />
                  Available for Sale
                </label>
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Add'} Medicine
                </button>
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <p className="loading">Loading medicines...</p>
          ) : medicines.length > 0 ? (
            <div className="medicines-table-wrapper">
              <table className="medicines-table">
                <thead>
                  <tr>
                    <th>Medicine Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((medicine) => {
                    const stockStatus = getStockStatus(medicine);
                    return (
                      <tr key={medicine._id} className={`status-${stockStatus.status}`}>
                        <td className="medicine-name">{medicine.name}</td>
                        <td>{medicine.category || 'Other'}</td>
                        <td className="price">₹{medicine.price.toFixed(2)}</td>
                        <td className="stock-cell">
                          <span className="stock-number">{medicine.stock || 0}</span>
                          {medicine.stockAlert && (
                            <span className="stock-alert">Alert: {medicine.stockAlert}</span>
                          )}
                        </td>
                        <td>
                          <span 
                            className="status-badge" 
                            style={{ backgroundColor: stockStatus.color }}
                          >
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="actions">
                          <button 
                            onClick={() => openStockModal(medicine)} 
                            className="btn btn-sm btn-warning"
                            title="Update Stock"
                          >
                            📦 Stock
                          </button>
                          {medicine.stock > 0 && (
                            <button 
                              onClick={() => handleMarkOutOfStock(medicine._id)} 
                              className="btn btn-sm btn-danger"
                              title="Mark Out of Stock"
                            >
                              ❌ OOS
                            </button>
                          )}
                          {medicine.stock === 0 && (
                            <button 
                              onClick={() => handleRestock(medicine._id, medicine.name)} 
                              className="btn btn-sm btn-success"
                              title="Restock"
                            >
                              ♻️ Restock
                            </button>
                          )}
                          <button 
                            onClick={() => handleEdit(medicine)} 
                            className="btn btn-sm btn-primary"
                            title="Edit Details"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(medicine._id)} 
                            className="btn btn-sm btn-danger"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-medicines">No medicines added yet. Click "Add Medicine" to get started.</p>
          )}
        </div>
      </div>

      {/* Stock Update Modal */}
      {editingStock && (
        <div className="modal-overlay" onClick={closeStockModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Stock - {stockModalData.medicineName}</h3>
              <button className="modal-close" onClick={closeStockModal}>×</button>
            </div>
            
            <form onSubmit={handleStockUpdate} className="stock-form">
              <div className="form-group">
                <label>Operation</label>
                <select
                  value={stockModalData.operation}
                  onChange={(e) => setStockModalData({...stockModalData, operation: e.target.value})}
                >
                  <option value="set">Set to (Replace)</option>
                  <option value="add">Add to Current</option>
                  <option value="subtract">Remove from Current</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={stockModalData.quantity}
                  onChange={(e) => setStockModalData({...stockModalData, quantity: e.target.value})}
                  placeholder="Enter quantity"
                  min="0"
                  required
                />
              </div>

              <div className="modal-buttons">
                <button type="submit" className="btn btn-primary">
                  Update Stock
                </button>
                <button type="button" onClick={closeStockModal} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
