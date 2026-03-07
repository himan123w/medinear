import { motion } from 'framer-motion';
import AnimatedCard from './AnimatedCard';
import RippleButton from './RippleButton';
import { CardSkeleton } from './LoadingSkeletons';
import { staggerContainerVariants, staggerItemVariants } from '../utils/useAnimations';
import './MicroAnimationsDemo.css';

export default function MicroAnimationsDemo() {
  const sampleCards = [
    {
      id: 1,
      title: 'Animated Card Hover',
      description: 'Subtly lifts up when you hover over it with smooth shadow transition.',
      icon: '✨'
    },
    {
      id: 2,
      title: 'Ripple Button',
      description: 'Click the button to see the ripple effect spreading from the click point.',
      icon: '🔘'
    },
    {
      id: 3,
      title: 'Loading Skeleton',
      description: 'Shows while content is loading with a pulsing shimmer animation.',
      icon: '⏳'
    },
    {
      id: 4,
      title: 'Page Transitions',
      description: 'Routes fade/slide smoothly when navigating between pages.',
      icon: '📄'
    }
  ];

  return (
    <div className="micro-animations-demo">
      <div className="demo-header">
        <h1>✨ Micro-Animations Demo</h1>
        <p>Framer Motion integration for premium interactions</p>
      </div>

      {/* Animated Cards Example */}
      <section className="demo-section">
        <h2>🎯 Card Hover Animations</h2>
        <motion.div
          className="demo-grid"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {sampleCards.map((card) => (
            <motion.div
              key={card.id}
              variants={staggerItemVariants}
            >
              <AnimatedCard variant="medium" className="demo-card">
                <div className="demo-card__icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </AnimatedCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Ripple Button Example */}
      <section className="demo-section">
        <h2>🔘 Button Ripple Effects</h2>
        <div className="demo-buttons">
          <RippleButton variant="primary" size="md">
            Primary Action
          </RippleButton>
          <RippleButton variant="secondary" size="md">
            Secondary Action
          </RippleButton>
          <RippleButton variant="success" size="md">
            Confirm
          </RippleButton>
          <RippleButton variant="danger" size="md">
            Delete
          </RippleButton>
        </div>
      </section>

      {/* Loading Skeleton Example */}
      <section className="demo-section">
        <h2>⏳ Loading Skeletons</h2>
        <div className="demo-skeleton-wrapper">
          <CardSkeleton />
        </div>
      </section>

      {/* Animation Info */}
      <section className="demo-section info-section">
        <h2>📚 How to Use</h2>
        <div className="info-grid">
          <div className="info-card">
            <h3>AnimatedCard</h3>
            <code>{'<AnimatedCard variant="medium">Content</AnimatedCard>'}</code>
          </div>
          <div className="info-card">
            <h3>RippleButton</h3>
            <code>{'<RippleButton variant="primary">Click Me</RippleButton>'}</code>
          </div>
          <div className="info-card">
            <h3>PageTransition</h3>
            <code>{'<PageTransition>{content}</PageTransition>'}</code>
          </div>
          <div className="info-card">
            <h3>useAnimations Hooks</h3>
            <code>{'const { isHovered } = useCardHover()'}</code>
          </div>
        </div>
      </section>
    </div>
  );
}
