import { useState, useCallback } from 'react';

/**
 * Hook for card hover lift animation
 * Returns event handlers and isHovered state for animation application
 */
export function useCardHover() {
  const [isHovered, setIsHovered] = useState(false);

  const onMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return {
    isHovered,
    onMouseEnter,
    onMouseLeave,
    animate: isHovered ? { y: -8, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' } : { y: 0, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }
  };
}

/**
 * Hook for tracking page transitions
 * Useful for scroll-to-top and loading state management
 */
export function usePageTransition() {
  const [isLoading, setIsLoading] = useState(false);

  const withTransition = useCallback((callback) => {
    return async (...args) => {
      setIsLoading(true);
      try {
        await callback(...args);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } finally {
        setIsLoading(false);
      }
    };
  }, []);

  return {
    isLoading,
    withTransition
  };
}

/**
 * Hook for smooth number animations
 * Animates from 0 to target value over duration
 */
export function useNumberAnimation(target, duration = 2000) {
  const [value, setValue] = useState(0);

  const easeOutQuad = (t) => t * (2 - t);

  useState(() => {
    let startTime;
    let animationId;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeOutQuad(progress);

      setValue(Math.floor(easeProgress * target));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [target, duration]);

  return value;
}

/**
 * Hook for debounced scroll detection
 * Useful for triggering animations on scroll
 */
export function useScrollDetection(handleScroll, debounceMs = 100) {
  const [isScrolling, setIsScrolling] = useState(false);
  let debounceTimer;

  useState(() => {
    const onScroll = () => {
      setIsScrolling(true);
      handleScroll?.();

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setIsScrolling(false);
      }, debounceMs);
    };

    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(debounceTimer);
    };
  }, [handleScroll, debounceMs]);

  return { isScrolling };
}

/**
 * Hook for managing animation state
 * Useful for controlling animation playback
 */
export function useAnimationState(initialState = false) {
  const [isAnimating, setIsAnimating] = useState(initialState);

  const start = useCallback(() => {
    setIsAnimating(true);
  }, []);

  const stop = useCallback(() => {
    setIsAnimating(false);
  }, []);

  const toggle = useCallback(() => {
    setIsAnimating((prev) => !prev);
  }, []);

  return {
    isAnimating,
    start,
    stop,
    toggle
  };
}

/**
 * Hook for staggered item animations
 * Returns delay value for nth item
 */
export function useStaggerAnimation(itemIndex, delayBetweenMs = 50) {
  return itemIndex * (delayBetweenMs / 1000);
}

/**
 * Hook for fade in animation on mount
 * Useful for smooth component entrance
 */
export function useFadeInAnimation(duration = 0.5) {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration }
  };
}

/**
 * Hook for slide animation
 * Direction: 'left', 'right', 'up', 'down'
 */
export function useSlideAnimation(direction = 'up', distance = 20, duration = 0.5) {
  const directions = {
    left: { x: -distance },
    right: { x: distance },
    up: { y: -distance },
    down: { y: distance }
  };

  return {
    initial: {
      opacity: 0,
      ...directions[direction]
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0
    },
    exit: {
      opacity: 0,
      ...directions[direction]
    },
    transition: { duration }
  };
}

/**
 * Hook for scale animation
 * Useful for growth/shrink effects
 */
export function useScaleAnimation(duration = 0.3, initialScale = 0.8) {
  return {
    initial: { scale: initialScale, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: initialScale, opacity: 0 },
    transition: { duration }
  };
}

/**
 * Hook for rotation animation
 * Useful for icons and spinners
 */
export function useRotationAnimation(duration = 2, infinite = true) {
  return {
    animate: { rotate: 360 },
    transition: {
      duration,
      repeat: infinite ? Infinity : 0,
      repeatType: 'loop',
      ease: 'linear'
    }
  };
}

/**
 * Hook for managing multiple animation states
 * Useful for complex components with several animated elements
 */
export function useMultipleAnimations(...names) {
  const [states, setStates] = useState(
    names.reduce((acc, name) => {
      acc[name] = false;
      return acc;
    }, {})
  );

  const setState = useCallback((name, value) => {
    setStates((prev) => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const toggle = useCallback((name) => {
    setStates((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  }, []);

  return { states, setState, toggle };
}

/**
 * Export animation variants for Framer Motion
 * Pre-configured animation patterns for common use cases
 */
export const animationVariants = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  fadeInSlow: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.6 }
  },

  // Slide animations
  slideInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3 }
  },
  slideInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  },
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3 }
  },

  // Scale animations
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: { duration: 0.3 }
  },
  scaleInLarge: {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
    transition: { duration: 0.4 }
  },

  // Bounce animation
  bounce: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatType: 'reverse'
      }
    }
  },

  // Pulse animation
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity
      }
    }
  },

  // Shimmer animation
  shimmer: {
    animate: {
      backgroundPosition: ['0% 0%', '100% 0%'],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  }
};

/**
 * Export stagger container for animated lists
 */
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0
    }
  }
};

/**
 * Export stagger item for use with stagger container
 */
export const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};
