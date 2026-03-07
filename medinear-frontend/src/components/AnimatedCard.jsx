import { motion } from 'framer-motion';
import { useCardHover } from '../utils/useAnimations';
import './AnimatedCard.css';

export default function AnimatedCard({
  children,
  className = '',
  variant = 'subtle',
  onClick,
  ...props
}) {
  const { isHovered, onMouseEnter, onMouseLeave, animate } = useCardHover();

  const variants = {
    subtle: {
      y: 0,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
    },
    medium: {
      y: 0,
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)'
    },
    strong: {
      y: 0,
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)'
    }
  };

  const hoverVariants = {
    subtle: {
      y: -4,
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)'
    },
    medium: {
      y: -8,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
    },
    strong: {
      y: -12,
      boxShadow: '0 24px 48px rgba(0, 0, 0, 0.25)'
    }
  };

  return (
    <motion.div
      className={`animated-card animated-card--${variant} ${className}`}
      initial={variants[variant]}
      animate={isHovered ? hoverVariants[variant] : variants[variant]}
      transition={{
        duration: 0.3,
        ease: 'easeOut'
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}
