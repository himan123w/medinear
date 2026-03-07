/**
 * Personalization Banner Component
 * Shows user-specific greetings and contextual information
 * Example: "Good evening Himanshu! 👋
 *          Medicines available near you in Lucknow"
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import './PersonalizationBanner.css';

export default function PersonalizationBanner({ 
  userLocation, 
  availableMedicinesCount = 0,
  nearbyPharmaciesCount = 0,
  cityName = 'your city'
}) {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [timeEmoji, setTimeEmoji] = useState('');

  // Get appropriate greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning');
      setTimeEmoji('🌅');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good afternoon');
      setTimeEmoji('☀️');
    } else if (hour >= 17 && hour < 21) {
      setGreeting('Good evening');
      setTimeEmoji('🌆');
    } else {
      setGreeting('Good night');
      setTimeEmoji('🌙');
    }
  }, []);

  const userName = user?.name || user?.firstName || 'there';
  const userCity = cityName.charAt(0).toUpperCase() + cityName.slice(1);

  return (
    <div className="personalization-banner">
      <div className="banner-content">
        {/* Left: Greeting */}
        <div className="greeting-section">
          <div className="greeting-text">
            <span className="time-emoji">{timeEmoji}</span>
            <div className="greeting-message">
              <h1 className="greeting-title">
                {greeting} <span className="user-name">{userName}</span>
                <span className="wave-emoji">👋</span>
              </h1>
              <p className="greeting-subtitle">
                {availableMedicinesCount > 0 ? (
                  <>
                    💊 <strong>{availableMedicinesCount} medicines</strong> available near you in <strong>{userCity}</strong>
                  </>
                ) : (
                  <>
                    📍 {nearbyPharmaciesCount > 0 ? `${nearbyPharmaciesCount} pharmacies nearby` : 'Pharmacies available'} in <strong>{userCity}</strong>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick Stats */}
        <div className="stats-section">
          {availableMedicinesCount > 0 && (
            <div className="stat-item available">
              <span className="stat-icon">✓</span>
              <div className="stat-content">
                <span className="stat-label">Available</span>
                <span className="stat-value">{availableMedicinesCount}</span>
              </div>
            </div>
          )}
          
          {nearbyPharmaciesCount > 0 && (
            <div className="stat-item pharmacies">
              <span className="stat-icon">📍</span>
              <div className="stat-content">
                <span className="stat-label">Nearby</span>
                <span className="stat-value">{nearbyPharmaciesCount}</span>
              </div>
            </div>
          )}

          {!userLocation?.latitude && (
            <div className="stat-item location-prompt">
              <span className="stat-icon">📍</span>
              <div className="stat-content">
                <span className="stat-label">Enable Location</span>
                <span className="stat-value">For better results</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Motivational Message */}
      <div className="motivation-text">
        {availableMedicinesCount > 0 ? (
          <>
            🎉 You're all set! <strong>{availableMedicinesCount} essential medicines</strong> are just a few clicks away from you.
          </>
        ) : (
          <>
            📍 Enable location to discover medicines near you instantly!
          </>
        )}
      </div>
    </div>
  );
}
