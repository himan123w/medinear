import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmergencyMedicineFinder from '../components/EmergencyMedicineFinder';

export default function Emergency() {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
      <button 
        className="back-button" 
        onClick={() => navigate(-1)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          background: '#f0f0f0',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        ← Back
      </button>
      
      <EmergencyMedicineFinder compact={false} />
    </div>
  );
}
