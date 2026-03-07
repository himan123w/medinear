import React, { useState, useEffect } from 'react';
import './PharmacyOpenStatus.css';

const PharmacyOpenStatus = ({ pharmacy, showDetails = true }) => {
  const [openStatus, setOpenStatus] = useState(null);

  useEffect(() => {
    if (pharmacy?.openStatus) {
      setOpenStatus(pharmacy.openStatus);
    } else {
      // Calculate open status on client side if not provided
      calculateOpenStatus();
    }

    // Update every minute
    const interval = setInterval(() => {
      calculateOpenStatus();
    }, 60000);

    return () => clearInterval(interval);
  }, [pharmacy]);

  const calculateOpenStatus = () => {
    if (!pharmacy) return;

    // Check if temporarily closed
    if (pharmacy.temporarilyClosed) {
      setOpenStatus({
        isOpen: false,
        status: 'Temporarily Closed',
        message: pharmacy.temporaryClosureReason || 'Temporarily closed',
        icon: '🔴',
        color: '#ff6b6b'
      });
      return;
    }

    // Check if 24x7
    if (pharmacy.open24x7) {
      setOpenStatus({
        isOpen: true,
        status: 'Open 24×7',
        message: 'Always open',
        icon: '🟢',
        color: '#51cf66'
      });
      return;
    }

    // Get current day and time
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const todayHours = pharmacy.operatingHours?.[currentDay];

    if (!todayHours || todayHours.closed) {
      setOpenStatus({
        isOpen: false,
        status: 'Closed',
        message: 'Closed today',
        icon: '🔴',
        color: '#ff6b6b'
      });
      return;
    }

    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const openMinutes = timeToMinutes(todayHours.open);
    const closeMinutes = timeToMinutes(todayHours.close);

    // Check if open
    if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
      const minutesUntilClose = closeMinutes - currentMinutes;
      
      if (minutesUntilClose <= 60) {
        setOpenStatus({
          isOpen: true,
          status: 'Closing Soon',
          message: `Closes in ${minutesUntilClose} min`,
          closesIn: minutesUntilClose,
          icon: '🟡',
          color: '#fab005'
        });
      } else {
        setOpenStatus({
          isOpen: true,
          status: 'Open Now',
          message: `Open until ${todayHours.close}`,
          icon: '🟢',
          color: '#51cf66'
        });
      }
    } else if (currentMinutes < openMinutes) {
      setOpenStatus({
        isOpen: false,
        status: 'Closed',
        message: `Opens at ${todayHours.open}`,
        icon: '🔴',
        color: '#ff6b6b'
      });
    } else {
      setOpenStatus({
        isOpen: false,
        status: 'Closed',
        message: 'Closed for the day',
        icon: '🔴',
        color: '#ff6b6b'
      });
    }
  };

  if (!openStatus) return null;

  if (!showDetails) {
    // Compact badge view
    return (
      <span 
        className={`open-status-badge ${openStatus.isOpen ? 'open' : 'closed'}`}
        style={{ backgroundColor: openStatus.color }}
        title={openStatus.message}
      >
        {openStatus.icon} {openStatus.status}
      </span>
    );
  }

  // Full details view
  return (
    <div className="open-status-container">
      <div 
        className={`open-status-indicator ${openStatus.isOpen ? 'open' : 'closed'}`}
        style={{ borderColor: openStatus.color }}
      >
        <div className="status-icon" style={{ color: openStatus.color }}>
          {openStatus.icon}
        </div>
        <div className="status-details">
          <div className="status-label" style={{ color: openStatus.color }}>
            {openStatus.status}
          </div>
          <div className="status-message">
            {openStatus.message}
          </div>
        </div>
      </div>

      {pharmacy.operatingHours && !pharmacy.open24x7 && (
        <div className="operating-hours-summary">
          {Object.entries(pharmacy.operatingHours).map(([day, hours]) => {
            const dayName = day.charAt(0).toUpperCase() + day.slice(1);
            return (
              <div key={day} className="day-hours">
                <span className="day-name">{dayName.slice(0, 3)}:</span>
                <span className="hours-range">
                  {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {pharmacy.breakTime?.enabled && (
        <div className="break-time-info">
          ☕ Break: {pharmacy.breakTime.start} - {pharmacy.breakTime.end}
        </div>
      )}
    </div>
  );
};

export default PharmacyOpenStatus;
