import { useState } from 'react';
import { motion } from 'framer-motion';
import './RippleButton.css';

export default function RippleButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  ...props
}) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (disabled) return;

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = {
      id: Date.now(),
      x,
      y
    };

    setRipples([...ripples, ripple]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
    }, 600);

    onClick?.(e);
  };

  return (
    <button
      className={`ripple-btn ripple-btn--${variant} ripple-btn--${size} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      <span className="ripple-btn__content">{children}</span>

      <div className="ripple-container">
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="ripple"
            initial={{
              width: 0,
              height: 0,
              opacity: 1,
              left: ripple.x,
              top: ripple.y
            }}
            animate={{
              width: 300,
              height: 300,
              opacity: 0,
              left: ripple.x - 150,
              top: ripple.y - 150
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut'
            }}
          />
        ))}
      </div>
    </button>
  );
}
