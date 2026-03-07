import React from 'react';
import { ReservationList } from '../components/ReservationTimer';
import './Reservations.css';

const Reservations = () => {
  return (
    <div className="reservations-page">
      <div className="page-header">
        <h1>🛒 My Reservations</h1>
        <p className="subtitle">Track your medicine reservations and timers</p>
      </div>

      <div className="info-cards">
        <div className="info-card">
          <div className="info-icon">⏰</div>
          <h3>30 Minutes</h3>
          <p>Reservation Duration</p>
        </div>
        <div className="info-card">
          <div className="info-icon">🔔</div>
          <h3>Real-time</h3>
          <p>Pharmacy Notifications</p>
        </div>
        <div className="info-card">
          <div className="info-icon">🔒</div>
          <h3>Stock Locked</h3>
          <p>Temporarily Reserved</p>
        </div>
      </div>

      <ReservationList />

      <div className="help-section">
        <h3>How Reservations Work</h3>
        <ul>
          <li>✅ Reserve medicine for 30 minutes</li>
          <li>✅ Stock is temporarily held for you</li>
          <li>✅ Pharmacy gets instant notification</li>
          <li>✅ Get 5-minute expiry warning</li>
          <li>✅ Extend reservation by 15 minutes if needed</li>
          <li>✅ Stock automatically restored if expired</li>
        </ul>
      </div>
    </div>
  );
};

export default Reservations;
