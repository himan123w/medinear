import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionAPI } from '../api';
import './Subscription.css';

export default function Subscription() {
  const navigate = useNavigate();
  const [diseaseType, setDiseaseType] = useState('diabetes');
  const [severity, setSeverity] = useState('moderate');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [diagnosisDate, setDiagnosisDate] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [reminderFrequency, setReminderFrequency] = useState('before-delivery');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [recommendations, setRecommendations] = useState(null);
  const [step, setStep] = useState(1); // Multi-step form
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const diseaseOptions = {
    diabetes: { name: 'Diabetes', price: { mild: 499, moderate: 799, severe: 1299 } },
    bp: { name: 'Blood Pressure (BP)', price: { mild: 399, moderate: 699, severe: 1099 } },
    heart: { name: 'Heart Disease', price: { mild: 599, moderate: 999, severe: 1499 } }
  };

  // Load recommendations when disease or severity changes
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const res = await subscriptionAPI.getDiseaseRecommendations(diseaseType, severity);
        if (res.data && res.data.success) {
          setRecommendations(res.data.recommendations);
        }
      } catch (err) {
        console.error('Error loading recommendations:', err);
      }
    };
    loadRecommendations();
  }, [diseaseType, severity]);

  const getCycleMultiplier = () => {
    if (frequency === 'quarterly') return 3;
    if (frequency === 'half-yearly') return 6;
    return 1;
  };

  const baseMonthlyPrice = diseaseOptions[diseaseType].price[severity];
  const cycleMultiplier = getCycleMultiplier();
  const cycleTotal = baseMonthlyPrice * cycleMultiplier;

  const validateStep = () => {
    if (step === 1) {
      if (!diseaseType || !severity) {
        setMessageType('error');
        setMessage('Please select disease type and severity.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test((phone || '').trim())) {
        setMessageType('error');
        setMessage('Please enter a valid 10-digit phone number.');
        return false;
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setMessageType('error');
        setMessage('Please enter a valid email address.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!address.trim() || !city.trim() || !state.trim() || !zipCode.trim()) {
        setMessageType('error');
        setMessage('Please complete delivery address, city, state, and zip code.');
        return false;
      }

      if (!acceptedTerms) {
        setMessageType('error');
        setMessage('Please accept subscription terms to continue.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!validateStep()) {
      return;
    }
    
    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    setLoading(true);
    try {
      const res = await subscriptionAPI.createSubscription({
        userId: localStorage.getItem('userId') || null,
        phone,
        email,
        diseaseType,
        severity,
        items: recommendations?.medicines || [],
        address,
        city,
        state,
        zipCode,
        paymentMethod: 'cod',
        frequency,
        reminderFrequency,
        patientDetails: {
          disease: diseaseType,
          severity,
          diagnosisDate: diagnosisDate ? new Date(diagnosisDate) : undefined,
          doctorName,
          hospitalName
        }
      });

      if (res.data && res.data.success) {
        setMessageType('success');
        setMessage('✓ Subscription created successfully! Your monthly medicines will be delivered automatically.');
        setTimeout(() => {
          navigate('/subscriptions');
        }, 2000);
      } else {
        setMessageType('error');
        setMessage('Failed to create subscription. Please try again.');
      }
    } catch (err) {
      setMessageType('error');
      setMessage(err?.response?.data?.message || 'Server error. Please try again.');
    }
    setLoading(false);
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="subscription-page">
      <div className="subscription-container">
        <h1>Chronic Patient Medicine Subscription</h1>
        <p className="subtitle">Automatic monthly delivery of medicines for Diabetes, BP, and Heart conditions</p>

        <div className="subscription-kpis">
          <div className="kpi-item">
            <span className="kpi-label">Monthly Price</span>
            <strong className="kpi-value">₹{baseMonthlyPrice}</strong>
          </div>
          <div className="kpi-item">
            <span className="kpi-label">Billing Cycle</span>
            <strong className="kpi-value">{frequency === 'monthly' ? '1 month' : frequency === 'quarterly' ? '3 months' : '6 months'}</strong>
          </div>
          <div className="kpi-item">
            <span className="kpi-label">Cycle Total</span>
            <strong className="kpi-value">₹{cycleTotal}</strong>
          </div>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <div className="subscription-progress-bar">
          <div className={`subscription-progress-step ${step >= 1 ? 'active' : ''}`}>
            <span>1</span> Disease & Severity
          </div>
          <div className={`subscription-progress-step ${step >= 2 ? 'active' : ''}`}>
            <span>2</span> Medical Details
          </div>
          <div className={`subscription-progress-step ${step >= 3 ? 'active' : ''}`}>
            <span>3</span> Delivery & Payment
          </div>
        </div>

        <form className="subscription-form" onSubmit={handleSubmit}>
          {/* Step 1: Disease & Severity */}
          {step === 1 && (
            <div className="form-step">
              <h2>Step 1: Select Your Condition</h2>

              <div className="form-group">
                <label>Disease Type *</label>
                <div className="disease-selector">
                  {Object.entries(diseaseOptions).map(([key, disease]) => (
                    <div
                      key={key}
                      className={`disease-card ${diseaseType === key ? 'selected' : ''}`}
                      onClick={() => setDiseaseType(key)}
                    >
                      <h3>{disease.name}</h3>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Severity Level *</label>
                <div className="severity-options">
                  {['mild', 'moderate', 'severe'].map(sev => (
                    <label key={sev} className="radio-option">
                      <input
                        type="radio"
                        value={sev}
                        checked={severity === sev}
                        onChange={(e) => setSeverity(e.target.value)}
                      />
                      <span className={`label-text ${sev}`}>
                        {sev.charAt(0).toUpperCase() + sev.slice(1)}
                        <small>₹{diseaseOptions[diseaseType].price[sev]}/month</small>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {recommendations && (
                <div className="recommendations-preview">
                  <h3>Recommended Medicines</h3>
                  <div className="medicines-list">
                    {recommendations.medicines.map((med, idx) => (
                      <div key={idx} className="medicine-item">
                        <strong>{med.name}</strong> - {med.dosage} ({med.frequency})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Medical Details */}
          {step === 2 && (
            <div className="form-step">
              <h2>Step 2: Medical Information</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Doctor Name</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Your treating doctor"
                  />
                </div>
                <div className="form-group">
                  <label>Hospital/Clinic Name</label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="Hospital name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Diagnosis Date</label>
                <input
                  type="date"
                  value={diagnosisDate}
                  onChange={(e) => setDiagnosisDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Your contact number"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>

              {recommendations && (
                <div className="health-guidelines">
                  <h3>Health Guidelines for {diseaseOptions[diseaseType].name}</h3>
                  <div className="guidelines-grid">
                    <div className="guideline-box">
                      <h4>✓ Do's</h4>
                      <ul>
                        {recommendations.diet.do.slice(0, 3).map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="guideline-box">
                      <h4>✗ Don'ts</h4>
                      <ul>
                        {recommendations.diet.avoid.slice(0, 3).map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Delivery & Payment */}
          {step === 3 && (
            <div className="form-step">
              <h2>Step 3: Delivery & Payment</h2>

              <h3>Delivery Address</h3>
              <div className="form-group">
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Complete address for medicine delivery"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="form-group">
                  <label>Zip Code</label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="Zip code"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Delivery Frequency</label>
                  <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly (3 months)</option>
                    <option value="half-yearly">Half-Yearly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Reminder Frequency</label>
                  <select value={reminderFrequency} onChange={(e) => setReminderFrequency(e.target.value)}>
                    <option value="before-delivery">Before Delivery</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="payment-summary">
                <h3>Subscription Summary</h3>
                <div className="summary-item">
                  <span>{diseaseOptions[diseaseType].name} ({severity})</span>
                  <strong>₹{diseaseOptions[diseaseType].price[severity]}/month</strong>
                </div>
                <div className="summary-item">
                  <span>Frequency</span>
                  <strong>{frequency === 'monthly' ? 'Monthly' : frequency === 'quarterly' ? 'Quarterly' : 'Half-Yearly'}</strong>
                </div>
                <div className="summary-item">
                  <span>Billing Cycle Total</span>
                  <strong>₹{cycleTotal}</strong>
                </div>
                <div className="summary-item">
                  <span>Payment Method</span>
                  <strong>Cash on Delivery (Free)</strong>
                </div>
                <div className="summary-total">
                  <span>Monthly Cost</span>
                  <strong>₹{diseaseOptions[diseaseType].price[severity]}</strong>
                </div>
              </div>

              <div className="terms">
                <label>
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    required
                  />
                  I agree to the subscription terms and auto-renewal policy
                </label>
              </div>
            </div>
          )}

          <div className="form-buttons">
            {step > 1 && (
              <button type="button" className="btn btn-secondary" onClick={goBack}>
                Back
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : (step === 3 ? 'Subscribe Now' : 'Next')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

