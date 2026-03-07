import { motion } from 'framer-motion';
import './LoadingSkeletons.css';

const pulseVariants = {
  initial: { opacity: 0.6 },
  animate: {
    opacity: 1,
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut'
    }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

export function MedicineSkeleton() {
  return (
    <motion.div
      className="medicine-skeleton"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="skeleton-line skeleton-title"
        variants={itemVariants}
        style={{ opacity: 0.6 }}
      >
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          style={{ height: '100%', borderRadius: '4px' }}
        />
      </motion.div>
      <motion.div
        className="skeleton-line skeleton-text"
        variants={itemVariants}
        style={{ opacity: 0.6 }}
      >
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          style={{ height: '100%', borderRadius: '4px' }}
        />
      </motion.div>
      <motion.div
        className="skeleton-line skeleton-price"
        variants={itemVariants}
        style={{ opacity: 0.6 }}
      >
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          style={{ height: '100%', borderRadius: '4px' }}
        />
      </motion.div>
    </motion.div>
  );
}

export function CardSkeleton() {
  return (
    <motion.div
      className="card-skeleton"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="skeleton-image"
        variants={itemVariants}
        style={{ opacity: 0.6 }}
      >
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          style={{ height: '100%', borderRadius: '8px' }}
        />
      </motion.div>
      <div className="skeleton-content">
        <motion.div
          className="skeleton-line skeleton-title"
          variants={itemVariants}
          style={{ opacity: 0.6 }}
        >
          <motion.div
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            style={{ height: '100%', borderRadius: '4px' }}
          />
        </motion.div>
        <motion.div
          className="skeleton-line skeleton-text"
          variants={itemVariants}
          style={{ opacity: 0.6 }}
        >
          <motion.div
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            style={{ height: '100%', borderRadius: '4px' }}
          />
        </motion.div>
        <motion.div
          className="skeleton-line skeleton-text short"
          variants={itemVariants}
          style={{ opacity: 0.6 }}
        >
          <motion.div
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            style={{ height: '100%', borderRadius: '4px' }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <motion.div
      className="list-skeleton"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="skeleton-row"
          variants={itemVariants}
        >
          <motion.div
            className="skeleton-line"
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            style={{ opacity: 0.6 }}
          />
          <motion.div
            className="skeleton-line"
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            style={{ opacity: 0.6 }}
          />
          <motion.div
            className="skeleton-line short"
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            style={{ opacity: 0.6 }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function FormSkeleton() {
  return (
    <motion.div
      className="form-skeleton"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="skeleton-line skeleton-title"
        variants={itemVariants}
        style={{ opacity: 0.6 }}
      >
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          style={{ height: '100%', borderRadius: '4px' }}
        />
      </motion.div>
      <motion.div
        className="skeleton-line"
        variants={itemVariants}
        style={{ opacity: 0.6 }}
      >
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          style={{ height: '100%', borderRadius: '4px' }}
        />
      </motion.div>
      <motion.div
        className="skeleton-line"
        variants={itemVariants}
        style={{ opacity: 0.6 }}
      >
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          style={{ height: '100%', borderRadius: '4px' }}
        />
      </motion.div>
      <motion.div
        className="skeleton-line short"
        variants={itemVariants}
        style={{ opacity: 0.6 }}
      >
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          style={{ height: '100%', borderRadius: '4px' }}
        />
      </motion.div>
    </motion.div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-text"></div>
      </div>
      <div className="skeleton-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-line"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
