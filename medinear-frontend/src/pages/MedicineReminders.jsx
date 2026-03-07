import { useState, useEffect } from 'react';
import { reminderAPI } from '../api';
import './Prescription.css';

export default function MedicineReminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    medicineName: '',
    frequency: 'monthly',
    daysBeforeReminder: 3,
    category: 'other',
    dosage: '',
    notes: ''
  });

  const [editingId, setEditingId] = useState(null);

  const categories = [
    { value: 'diabetes', label: '🩺 Diabetes' },
    { value: 'bp', label: '❤️ Blood Pressure' },
    { value: 'thyroid', label: '🦋 Thyroid' },
    { value: 'vitamin', label: '💪 Vitamin' },
    { value: 'antibiotic', label: '💊 Antibiotic' },
    { value: 'painkiller', label: '🔴 Painkiller' },
    { value: 'other', label: '📋 Other' }
  ];

  const frequencies = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  useEffect(() => {
    loadReminders();
  }, []);

  const showNotif = (msg, type = 'success') => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const loadReminders = async () => {
    try {
      setLoading(true);
      const res = await reminderAPI.getMyReminders();
      setReminders(res.data.reminders || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
      showNotif('Error loading reminders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.medicineName.trim()) {
      showNotif('Please enter medicine name', 'error');
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        // Update
        await reminderAPI.updateReminder(editingId, formData);
        showNotif('Reminder updated successfully');
      } else {
        // Create
        await reminderAPI.createReminder(formData);
        showNotif('Reminder created successfully');
      }

      resetForm();
      loadReminders();
    } catch (error) {
      console.error('Error saving reminder:', error);
      showNotif('Error saving reminder: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (reminder) => {
    setFormData({
      medicineName: reminder.medicineName,
      frequency: reminder.frequency,
      daysBeforeReminder: reminder.daysBeforeReminder,
      category: reminder.category,
      dosage: reminder.dosage || '',
      notes: reminder.notes || ''
    });
    setEditingId(reminder._id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;

    try {
      setLoading(true);
      await reminderAPI.deleteReminder(id);
      showNotif('Reminder deleted successfully');
      loadReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      showNotif('Error deleting reminder', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      setLoading(true);
      await reminderAPI.toggleReminder(id);
      loadReminders();
    } catch (error) {
      console.error('Error toggling reminder:', error);
      showNotif('Error toggling reminder', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      medicineName: '',
      frequency: 'monthly',
      daysBeforeReminder: 3,
      category: 'other',
      dosage: '',
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilReminder = (nextReminderDate) => {
    const now = new Date();
    const nextDate = new Date(nextReminderDate);
    const diffTime = nextDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="prescription-container">
      <div className="prescriptions-section">
        <h2>⏰ Medicine Refill Reminders</h2>

        {notification && (
          <div style={{
            background: '#f0f0f0',
            color: '#333',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            border: '1px solid #ddd'
          }}>
            {notification}
          </div>
        )}

        {/* Form Section */}
        {showForm && (
          <div style={{
            background: '#f9f9f9',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '2px solid #4CAF50'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
              {editingId ? '✏️ Edit Reminder' : '➕ Add New Reminder'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Medicine Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Metformin, Amlodipine, Levothyroxine"
                  value={formData.medicineName}
                  onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Dosage (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 500mg, 1 tablet"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Frequency *
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    {frequencies.map(freq => (
                      <option key={freq.value} value={freq.value}>{freq.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Days Before Reminder
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.daysBeforeReminder}
                    onChange={(e) => setFormData({ ...formData, daysBeforeReminder: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Reminder will trigger 3 days before refill date
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Notes (optional)
                </label>
                <textarea
                  placeholder="e.g., Take with food, side effects..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    fontFamily: 'Arial, sans-serif',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: loading ? '#ccc' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  {editingId ? '✏️ Update Reminder' : '➕ Create Reminder'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#999',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              marginBottom: '20px',
              padding: '12px 20px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            ➕ Add New Reminder
          </button>
        )}

        {/* Reminders List */}
        {reminders.length > 0 ? (
          <div>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
              You have {reminders.length} reminder(s) configured
            </p>
            <div style={{ display: 'grid', gap: '16px' }}>
              {reminders.map((reminder) => {
                const daysUntil = getDaysUntilReminder(reminder.nextReminderDate);
                const categoryLabel = categories.find(c => c.value === reminder.category)?.label || reminder.category;

                return (
                  <div
                    key={reminder._id}
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '16px',
                      background: reminder.enabled ? 'white' : '#f5f5f5',
                      opacity: reminder.enabled ? 1 : 0.6
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#1a1a1a' }}>
                          {reminder.medicineName}
                          {reminder.dosage && ` - ${reminder.dosage}`}
                        </h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                          {categoryLabel}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggle(reminder._id)}
                        style={{
                          padding: '6px 12px',
                          background: reminder.enabled ? '#4CAF50' : '#999',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {reminder.enabled ? '✓ Active' : '⊘ Paused'}
                      </button>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '12px',
                      marginBottom: '12px',
                      fontSize: '13px'
                    }}>
                      <div style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                        <span style={{ color: '#666' }}>Frequency:</span>
                        <strong style={{ marginLeft: '6px', textTransform: 'capitalize' }}>
                          {reminder.frequency}
                        </strong>
                      </div>
                      <div style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                        <span style={{ color: '#666' }}>Next Reminder:</span>
                        <strong style={{ marginLeft: '6px' }}>
                          {formatDate(reminder.nextReminderDate)}
                        </strong>
                      </div>
                      <div style={{
                        background: daysUntil <= 3 ? '#fff3cd' : '#f5f5f5',
                        padding: '8px',
                        borderRadius: '4px'
                      }}>
                        <span style={{ color: '#666' }}>Days Until:</span>
                        <strong style={{
                          marginLeft: '6px',
                          color: daysUntil <= 3 ? '#ff9800' : '#1a1a1a'
                        }}>
                          {daysUntil} days
                        </strong>
                      </div>
                    </div>

                    {reminder.notes && (
                      <p style={{
                        margin: '12px 0',
                        padding: '8px',
                        background: '#e3f2fd',
                        borderRadius: '4px',
                        fontSize: '13px',
                        color: '#1565c0',
                        borderLeft: '3px solid #1565c0'
                      }}>
                        📝 {reminder.notes}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleEdit(reminder)}
                        style={{
                          padding: '6px 12px',
                          background: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(reminder._id)}
                        style={{
                          padding: '6px 12px',
                          background: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999'
          }}>
            <p style={{ fontSize: '16px', marginBottom: '10px' }}>📝 No reminders set yet</p>
            <p style={{ fontSize: '13px', color: '#bbb' }}>Click "Add New Reminder" to set up medicine refill reminders.</p>
          </div>
        )}
      </div>
    </div>
  );
}
