import React, { useState } from 'react';
import { deliveryAPI } from '../api';
import './DeliveryPartnerRegistration.css';

export default function DeliveryPartnerRegistration({ onRegistrationSuccess, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleType: 'bike',
    aadharNumber: '',
    bankAccountNumber: '',
    bankIFSC: '',
    upiId: '',
    licenseNumber: '',
    serviceAreas: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = () => {
    // Validate current step
    if (step === 1) {
      if (!formData.name || !formData.phone || !formData.vehicleType) {
        setError('Please fill all fields in this step');
        return;
      }
      if (formData.phone.length !== 10) {
        setError('Phone number must be 10 digits');
        return;
      }
    } else if (step === 2) {
      if (!formData.aadharNumber || !formData.licenseNumber) {
        setError('Please provide required documents');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const registrationData = {
        ...formData,
        // Convert serviceAreas string to array
        serviceAreas: formData.serviceAreas
          .split(',')
          .map(area => area.trim())
          .filter(area => area !== ''),
        // Generate default location (user will update via app)
        lat: 0,
        lng: 0
      };

      const response = await deliveryAPI.registerPartner(registrationData);
      
      setSuccess('✅ Registration successful! Welcome to 🏥 MediNear delivery network.');
      setFormData({
        name: '',
        phone: '',
        vehicleType: 'bike',
        aadharNumber: '',
        bankAccountNumber: '',
        bankIFSC: '',
        upiId: '',
        licenseNumber: '',
        serviceAreas: ''
      });
      setStep(1);

      if (onRegistrationSuccess) {
        onRegistrationSuccess(response.data.partner);
      }

      setTimeout(() => {
        if (onClose) onClose();
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="partner-registration">
      {/* Header */}
      <div className="reg-header">
        <h2>🚚 Delivery Partner Registration</h2>
        <p>Join our network and start earning</p>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <p>Basic Info</p>
        </div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <p>Documents</p>
        </div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <p>Payment</p>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="registration-form">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="form-step">
            <h3>📋 Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <div className="phone-input">
                <span className="country-code">+91</span>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  pattern="[0-9]{10}"
                  required
                />
              </div>
              <p className="hint">We'll use this for customer contact and payments</p>
            </div>

            <div className="form-group">
              <label htmlFor="vehicleType">Vehicle Type *</label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                required
              >
                <option value="bike">🏍️ Bike/Motorcycle</option>
                <option value="scooter">🛵 Scooter</option>
                <option value="cycle">🚴 Cycle/E-Cycle</option>
                <option value="car">🚗 Car</option>
                <option value="auto">🛺 Auto Rickshaw</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Documents */}
        {step === 2 && (
          <div className="form-step">
            <h3>📄 Document Verification</h3>
            <p className="step-description">Please provide valid government-issued documents</p>

            <div className="form-group">
              <label htmlFor="aadharNumber">Aadhar Number *</label>
              <input
                type="text"
                id="aadharNumber"
                name="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleInputChange}
                placeholder="12-digit Aadhar number"
                maxLength="12"
                pattern="[0-9]{12}"
                required
              />
              <p className="hint">12-digit unique identification number</p>
            </div>

            <div className="form-group">
              <label htmlFor="licenseNumber">Driving License Number *</label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                placeholder="Enter license number"
                required
              />
              <p className="hint">Provide a valid driving license</p>
            </div>

            <div className="info-box">
              <p>📸 Document verification typically takes 24-48 hours</p>
              <p>✓ Your information is encrypted and secure</p>
            </div>
          </div>
        )}

        {/* Step 3: Payment Details */}
        {step === 3 && (
          <div className="form-step">
            <h3>💰 Payment Information</h3>
            <p className="step-description">Set up your payment methods for earnings withdrawal</p>

            <div className="form-group">
              <label htmlFor="upiId">UPI ID *</label>
              <input
                type="text"
                id="upiId"
                name="upiId"
                value={formData.upiId}
                onChange={handleInputChange}
                placeholder="yourname@bankname"
                required
              />
              <p className="hint">e.g., rajesh@okhdfcbank</p>
            </div>

            <div className="form-group">
              <label htmlFor="bankAccountNumber">Bank Account Number *</label>
              <input
                type="text"
                id="bankAccountNumber"
                name="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={handleInputChange}
                placeholder="Account number"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bankIFSC">Bank IFSC Code *</label>
              <input
                type="text"
                id="bankIFSC"
                name="bankIFSC"
                value={formData.bankIFSC}
                onChange={handleInputChange}
                placeholder="e.g., HDFC0000001"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="serviceAreas">Service Areas</label>
              <input
                type="text"
                id="serviceAreas"
                name="serviceAreas"
                value={formData.serviceAreas}
                onChange={handleInputChange}
                placeholder="e.g., Downtown, Uptown, Mall Road (comma separated)"
              />
              <p className="hint">Areas where you're willing to deliver</p>
            </div>

            <div className="info-box">
              <p>💳 Your bank details are secure and encrypted</p>
              <p>📊 Track your earnings in real-time from the app</p>
              <p>⏰ Weekly payouts every Friday</p>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Form Actions */}
        <div className="form-actions">
          {step > 1 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handlePreviousStep}
              disabled={loading}
            >
              ← Previous
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              className="btn-primary"
              onClick={handleNextStep}
              disabled={loading}
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              className="btn-primary submit-btn"
              disabled={loading}
            >
              {loading ? '⏳ Registering...' : '✅ Complete Registration'}
            </button>
          )}
        </div>

        {/* Terms */}
        <div className="terms-section">
          <label className="checkbox-label">
            <input type="checkbox" required />
            <span>I agree to Terms & Conditions and Privacy Policy</span>
          </label>
        </div>
      </form>
    </div>
  );
}
