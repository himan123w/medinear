import { motion, AnimatePresence } from 'framer-motion';
import './PageTransition.css';

export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  center: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }
};

export const pageVariantsSlide = {
  initial: {
    opacity: 0,
    x: 100
  },
  center: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }
};

export const pageVariantsFade = {
  initial: {
    opacity: 0
  },
  center: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }
};

export function PageTransition({ children, variant = 'default' }) {
  let variants = pageVariants;
  
  if (variant === 'slide') {
    variants = pageVariantsSlide;
  } else if (variant === 'fade') {
    variants = pageVariantsFade;
  }

  return (
    <motion.div
      initial="initial"
      animate="center"
      exit="exit"
      variants={variants}
      className="page-transition"
    >
      {children}
    </motion.div>
  );
}

export function PageTransitionWrap({ children, variant = 'default' }) {
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname} variant={variant}>
        {children}
      </PageTransition>
    </AnimatePresence>
  );
}
