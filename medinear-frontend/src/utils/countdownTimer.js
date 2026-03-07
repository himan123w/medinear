/**
 * Countdown Timer Utility
 * Manages reservation countdown and formats time display
 */

export const formatTimeRemaining = (seconds) => {
  if (seconds <= 0) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const getReservationEndTime = (startTime = new Date()) => {
  // Add 30 minutes to the current time
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
  return endTime;
};

export const getTimeUntilExpiry = (expiryTime) => {
  if (!expiryTime) return 0;
  
  const now = new Date().getTime();
  const expiry = new Date(expiryTime).getTime();
  const remaining = Math.max(0, expiry - now);
  
  return Math.floor(remaining / 1000); // Return in seconds
};

export const formatExpiredTime = (expiryTime) => {
  if (!expiryTime) return '';
  
  const expiry = new Date(expiryTime);
  const hours = expiry.getHours();
  const minutes = expiry.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

export const useCountdownTimer = (expiryTime, callback) => {
  const getTimeLeft = () => getTimeUntilExpiry(expiryTime);
  
  return {
    getFormattedTime: () => formatTimeRemaining(getTimeLeft()),
    getSeconds: getTimeLeft,
    isExpired: () => getTimeLeft() <= 0,
  };
};
