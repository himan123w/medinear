import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../AuthContext';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      login(response.data.pharmacy, response.data.token);
      alert('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card pharmacy-login-card">
        <div className="auth-header">
          <div className="auth-icon pharmacy-icon">🏥</div>
          <h1 className="auth-title">🏥 MediNear</h1>
          <p className="auth-subtitle">Your Medicine Availability Platform</p>
          <p className="auth-subtitle" style={{marginTop: '8px', fontSize: '14px'}}>Pharmacy Dashboard Login</p>
        </div>

        {error && (
          <div className="error-message error-animated">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="pharmacy-login-form">
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              <span className="label-icon">📱</span>
              <span className="label-text">Phone Number</span>
            </label>
            <div className="input-wrapper">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused(null)}
                placeholder="10-digit phone number"
                required
                className={focused === 'phone' ? 'input-focused' : ''}
              />
              <span className="input-focus-border"></span>
            </div>
            <small className="field-hint">Your contact number registered with us</small>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <span className="label-icon">🔒</span>
              <span className="label-text">Password</span>
            </label>
            <div className="input-wrapper">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="Enter your secure password"
                required
                className={focused === 'password' ? 'input-focused' : ''}
              />
              <span className="input-focus-border"></span>
            </div>
            <small className="field-hint">Keep your password safe and secure</small>
          </div>

          <button 
            type="submit" 
            className={`btn btn-primary btn-full btn-login ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
          >
            <span className="btn-icon">🔓</span>
            <span className="btn-text">
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </span>
            {loading && <span className="btn-spinner"></span>}
          </button>
        </form>

        <div className="login-divider">
          <span>New to 🏥 MediNear?</span>
        </div>

        <Link to="/register" className="btn btn-secondary btn-full btn-register">
          <span className="btn-icon">📝</span>
          <span className="btn-text">Register Your Pharmacy</span>
        </Link>

        <div className="login-footer">
          <Link to="/" className="footer-link">
            <span className="link-icon">🏠</span>
            Back to Home
          </Link>
          <a href="#forgot" className="footer-link">
            <span className="link-icon">❓</span>
            Need Help?
          </a>
        </div>

        <div className="pharmacy-features">
          <p className="features-title">What you can do:</p>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span className="feature-name">Analytics</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📦</span>
              <span className="feature-name">Inventory</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💰</span>
              <span className="feature-name">Billing</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📋</span>
              <span className="feature-name">Prescriptions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
