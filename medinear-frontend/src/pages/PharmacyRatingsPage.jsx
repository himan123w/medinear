import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { pharmacyAPI } from '../api';
import PharmacyRatingForm from '../components/PharmacyRatingForm';
import RatingSummary from '../components/RatingSummary';
import './PharmacyDetail.css';

export default function PharmacyRatingsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPharmacy();
  }, [id]);

  const loadPharmacy = async () => {
    try {
      setLoading(true);
      const res = await pharmacyAPI.getPharmacies();

      // Support both raw array and wrapped response formats.
      const pharmacyList = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      const selectedPharmacy = pharmacyList.find((p) => p._id === id);
      if (selectedPharmacy) {
        setPharmacy(selectedPharmacy);
        setError('');
      } else {
        setError('Pharmacy not found');
      }
    } catch (err) {
      setError('Failed to load pharmacy details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!pharmacy) return <div className="error">Pharmacy not found</div>;

  return (
    <div className="pharmacy-detail-page">
      <div className="container">
        {/* Pharmacy Info */}
        <div className="pharmacy-header">
          <div className="pharmacy-info">
            <h1>{pharmacy.name}</h1>
            <div className="pharmacy-meta">
              <p className="address">📍 {pharmacy.address || pharmacy.area}</p>
              <p className="phone">📞 {pharmacy.phone}</p>
              {pharmacy.open24x7 && (
                <span className="badge open24x7">🌙 Open 24/7</span>
              )}
              <span className="badge delivery">🚚 {pharmacy.deliveryTime} min</span>
            </div>
          </div>
        </div>

        {/* Ratings Section */}
        <div className="ratings-section">
          <h2>Pharmacy Ratings & Reviews</h2>
          
          {/* Rating Summary */}
          <RatingSummary pharmacyId={id} />

          {/* Rating Form */}
          <PharmacyRatingForm
            pharmacyId={id}
            pharmacyName={pharmacy.name}
            userPhone={user?.phone || localStorage.getItem('userPhone')}
            onRatingSubmitted={() => {
              // Reload ratings when new rating is submitted
              loadPharmacy();
            }}
          />
        </div>
      </div>
    </div>
  );
}
