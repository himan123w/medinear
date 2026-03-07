import { useState, useEffect } from 'react';
import './AnimatedCounter.css';

export default function AnimatedCounter({ 
  target = 0, 
  label = '', 
  icon = '📊',
  duration = 2000,
  format = 'number',
  decimals = 0
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation when component mounts or target changes
    setIsVisible(true);
    setCount(0);

    const startTime = Date.now();
    const startValue = 0;
    const endValue = target;
    const startTimestamp = null;

    const animate = (timestamp) => {
      if (!startTimestamp) {
        const newStartTime = timestamp;
        const elapsed = timestamp - newStartTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = startValue + (endValue - startValue) * easeOutQuad(progress);
        setCount(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      } else {
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = startValue + (endValue - startValue) * easeOutQuad(progress);
        setCount(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }
    };

    // Simpler animation loop
    let start = null;
    const frame = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const value = startValue + (endValue - startValue) * easeOutQuad(progress);
      setCount(value);

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);
  }, [target, duration]);

  const easeOutQuad = (t) => {
    return 1 - (1 - t) * (1 - t);
  };

  const formatValue = (val) => {
    const roundedVal = decimals > 0 ? val.toFixed(decimals) : Math.round(val);
    
    if (format === 'currency') {
      return `₹${roundedVal.toLocaleString()}`;
    } else if (format === 'percentage') {
      return `${roundedVal}%`;
    } else if (format === 'short') {
      // Convert to K/M format
      if (roundedVal >= 1000000) {
        return `${(roundedVal / 1000000).toFixed(1)}M`;
      } else if (roundedVal >= 1000) {
        return `${(roundedVal / 1000).toFixed(1)}K`;
      }
      return roundedVal.toString();
    }
    
    return roundedVal.toLocaleString();
  };

  return (
    <div className={`animated-counter ${isVisible ? 'visible' : ''}`}>
      <div className="counter-icon">{icon}</div>
      <div className="counter-content">
        <div className="counter-value">{formatValue(count)}</div>
        {label && <div className="counter-label">{label}</div>}
      </div>
    </div>
  );
}
