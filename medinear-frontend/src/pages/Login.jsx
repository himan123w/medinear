import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../AuthContext';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginType, setLoginType] = useState('user'); // 'user' or 'pharmacy'
  const [formData, setFormData] = useState({
    identifier: '',
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
      let response;
      if (loginType === 'user') {
        // User login
        const identifier = formData.identifier.trim();
        const isEmail = identifier.includes('@');
        response = await authAPI.userLogin({
          email: isEmail ? identifier : '',
          phone: isEmail ? '' : identifier,
          password: formData.password
        });
        login(response.data.user, response.data.token);
        alert('Login successful!');

        const role = response.data.user?.role;
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'pharmacy') {
          navigate('/pharmacy');
        } else {
          navigate('/dashboard');
        }
      } else {
        // Pharmacy login
        response = await authAPI.login({
          phone: formData.phone,
          password: formData.password
        });
        login(response.data.pharmacy, response.data.token);
        alert('Login successful!');
        navigate('/pharmacy');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className={`auth-card ${loginType === 'pharmacy' ? 'pharmacy-login-card' : 'user-login-card'}`}>
        <div className="auth-header">
          <div className={`auth-icon ${loginType === 'pharmacy' ? 'pharmacy-icon' : ''}`}>
            {loginType === 'pharmacy' ? '🏥' : '👤'}
          </div>
          <h1 className="auth-title">🏥 MediNear</h1>
          <p className="auth-subtitle">Your Medicine Availability Platform</p>
        </div>

        {/* Login Type Tabs */}
        <div className="login-type-tabs">
          <button
            className={`login-type-tab ${loginType === 'user' ? 'active' : ''}`}
            onClick={() => {
              setLoginType('user');
              setFormData({ identifier: '', phone: '', password: '' });
              setError('');
            }}
          >
            👤 User Login
          </button>
          <button
            className={`login-type-tab ${loginType === 'pharmacy' ? 'active' : ''}`}
            onClick={() => {
              setLoginType('pharmacy');
              setFormData({ identifier: '', phone: '', password: '' });
              setError('');
            }}
          >
            🏥 Pharmacy Login
          </button>
        </div>

        {error && (
          <div className="error-message error-animated">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={`${loginType === 'pharmacy' ? 'pharmacy-login-form' : 'user-login-form'}`}>
          {loginType === 'user' ? (
            <>
              {/* User Email Field */}
              <div className="form-group">
                <label className="form-label">Email or Phone</label>
                <div className={`form-field ${focused === 'identifier' ? 'focused' : ''}`}>
                  <span className="form-icon">📧</span>
                  <input
                    type="text"
                    name="identifier"
                    placeholder="Enter email or phone"
                    value={formData.identifier}
                    onChange={handleChange}
                    onFocus={() => setFocused('identifier')}
                    onBlur={() => setFocused(null)}
                    required
                    className="form-input"
                    inputMode="email"
                    autoComplete="username"
                    autoCapitalize="off"
                  />
                </div>
              </div>

              {/* User Password Field */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className={`form-field ${focused === 'password' ? 'focused' : ''}`}>
                  <span className="form-icon">🔐</span>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    required
                    className="form-input"
                    autoComplete="current-password"
                    autoCapitalize="off"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Pharmacy Phone Field */}
              <div className="form-group pharmacy-form-group">
                <label className="form-label">Phone Number</label>
                <div className={`form-field pharmacy-field ${focused === 'phone' ? 'focused' : ''}`}>
                  <span className="form-icon">📱</span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => setFocused('phone')}
                    onBlur={() => setFocused(null)}
                    required
                    className="form-input"
                    inputMode="tel"
                    autoComplete="tel"
                    autoCapitalize="off"
                  />
                </div>
              </div>

              {/* Pharmacy Password Field */}
              <div className="form-group pharmacy-form-group">
                <label className="form-label">Password</label>
                <div className={`form-field pharmacy-field ${focused === 'password' ? 'focused' : ''}`}>
                  <span className="form-icon">🔐</span>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    required
                    className="form-input"
                    autoComplete="current-password"
                    autoCapitalize="off"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary btn-full btn-login ${loading ? 'btn-loading' : ''}`}
          >
            {loading ? '🔄 Logging in...' : (loginType === 'user' ? '👤 Login' : '🏥 Login to Pharmacy')}
          </button>
        </form>

        <div className="login-divider">
          <span>OR</span>
        </div>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="link-primary">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
