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
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
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

  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || (medicine.category || 'Other') === categoryFilter;
    const matchesStock = stockFilter === 'all' || getStockStatus(medicine).status === stockFilter;
    return matchesSearch && matchesCategory && matchesStock;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStockFilter('all');
  };

  const handleQuickFilter = (filter) => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStockFilter(filter);
    document.querySelector('.medicines-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            <span className="dashboard-eyebrow">OPERATIONS CENTER · LIVE INVENTORY</span>
            <h1>Pharmacy Dashboard</h1>
          </div>
          <div className="dashboard-welcome">
            <p>
              <span className="welcome-greeting">Welcome back, {user?.name || 'User'}.</span>
              <span className="welcome-message">Keep your medicine availability accurate and up to date.</span>
            </p>
          </div>
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
        <div className="dashboard-quick-stats">
          <button type="button" className="quick-stat-card" onClick={() => handleQuickFilter('all')} title="Show all medicines">
            <span className="quick-stat-icon">💊</span>
            <div className="quick-stat-content">
              <strong>{medicines.length}</strong>
              <small>Total Medicines</small>
            </div>
          </button>
          <button type="button" className="quick-stat-card" onClick={() => handleQuickFilter('good')} title="Show medicines with good stock">
            <span className="quick-stat-icon">✅</span>
            <div className="quick-stat-content">
              <strong>{medicines.filter(m => m.available && m.stock > 0).length}</strong>
              <small>In Stock</small>
            </div>
          </button>
          <button type="button" className="quick-stat-card" onClick={() => handleQuickFilter('low_stock')} title="Show low stock medicines">
            <span className="quick-stat-icon">⚠️</span>
            <div className="quick-stat-content">
              <strong>{medicines.filter(m => m.stock > 0 && m.stock < (m.stockAlert || 10)).length}</strong>
              <small>Low Stock</small>
            </div>
          </button>
          <button type="button" className="quick-stat-card" onClick={() => handleQuickFilter('out_of_stock')} title="Show out of stock medicines">
            <span className="quick-stat-icon">❌</span>
            <div className="quick-stat-content">
              <strong>{medicines.filter(m => !m.available || m.stock === 0).length}</strong>
              <small>Out of Stock</small>
            </div>
          </button>
        </div>
      </header>

      <div className="dashboard-heatmap-preview fade-in-up">
        <HeatmapPreviewCard compact={true} />
      </div>

      <div className="dashboard-content">
        <div className="medicines-section fade-in-up">
          <div className="section-header">
            <div className="section-heading-copy">
              <span className="section-kicker">INVENTORY</span>
              <h2>Medicines</h2>
              <p>Keep availability accurate and customers informed.</p>
            </div>
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

          {!loading && medicines.length > 0 && (
            <div className="inventory-toolbar" aria-label="Filter medicines">
              <div className="inventory-toolbar-heading">
                <span className="inventory-result-count">
                  Showing <strong>{filteredMedicines.length}</strong> of {medicines.length}
                </span>
                {(searchTerm || categoryFilter !== 'all' || stockFilter !== 'all') && (
                  <button type="button" className="clear-filters" onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
              </div>
              <div className="inventory-filters">
                <label className="inventory-search">
                  <span aria-hidden="true">⌕</span>
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search medicines"
                    aria-label="Search medicines"
                  />
                </label>
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter by category">
                  <option value="all">All categories</option>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)} aria-label="Filter by stock status">
                  <option value="all">All stock health</option>
                  <option value="good">Good stock</option>
                  <option value="low_stock">Low stock</option>
                  <option value="out_of_stock">Out of stock</option>
                </select>
              </div>
            </div>
          )}

          {loading ? (
            <p className="loading">Loading medicines...</p>
          ) : filteredMedicines.length > 0 ? (
            <div className="medicines-table-wrapper fade-in-up">
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
                  {filteredMedicines.map((medicine) => {
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
          ) : medicines.length > 0 ? (
            <p className="no-medicines">No medicines match these filters. Try clearing your search or selecting a different status.</p>
          ) : (
            <p className="no-medicines">No medicines added yet. Click "Add Medicine" to get started.</p>
          )}
        </div>
      </div>

      {/* Stock Update Modal */}
      {editingStock && (
        <div className="modal-overlay" onClick={closeStockModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Update medicine stock">
            <div className="modal-header">
              <h3>Update Stock - {stockModalData.medicineName}</h3>
              <button className="modal-close" onClick={closeStockModal} type="button" aria-label="Close stock update modal">×</button>
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
