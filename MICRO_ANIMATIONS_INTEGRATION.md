# 🎬 Micro-Animations Integration Guide

## Phase 6: Framer Motion Micro-Interactions

This guide covers all the animation components and hooks created for Medinear's premium UI/UX enhancement.

## Components Overview

### 1. **AnimatedCard** - Hover Lift Animation
Wrapper component that applies smooth hover lift animation to cards.

**Location**: `/src/components/AnimatedCard.jsx`

**Usage**:
```jsx
import AnimatedCard from './components/AnimatedCard';

<AnimatedCard variant="medium" className="custom-class">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</AnimatedCard>
```

**Variants**:
- `subtle` - Small lift (4px), light shadow
- `medium` - Medium lift (8px), medium shadow
- `strong` - Large lift (12px), strong shadow

**Features**:
- Smooth 0.3s transition with easeOut easing
- Dynamic shadow on hover
- Responds to mouse enter/leave
- Full keyboard accessibility (focus-visible states)
- Dark mode support

---

### 2. **RippleButton** - Click Ripple Effect
Button component with ripple effect animation on click.

**Location**: `/src/components/RippleButton.jsx`

**Usage**:
```jsx
import RippleButton from './components/RippleButton';

<RippleButton variant="primary" size="md" onClick={handleClick}>
  Click Me
</RippleButton>
```

**Variants**:
- `primary` - Purple gradient with shadow
- `secondary` - Light purple with border
- `success` - Green
- `danger` - Red
- `warning` - Yellow
- `ghost` - Transparent with border

**Sizes**:
- `xs` - Extra small padding
- `sm` - Small padding
- `md` - Medium padding (default)
- `lg` - Large padding

**Features**:
- Framer Motion ripple animation
- 0.6s animation duration
- Smooth fade-out effect
- Hover lift effect (-2px translateY)
- Disabled state support
- Responsive sizing

---

### 3. **LoadingSkeletons** - Enhanced with Framer Motion
Pre-made skeleton loaders with pulse animations.

**Location**: `/src/components/LoadingSkeletons.jsx`

**Usage**:
```jsx
import { CardSkeleton, ListSkeleton, MedicineSkeleton, FormSkeleton } from './components/LoadingSkeletons';

<CardSkeleton />
<ListSkeleton count={5} />
<MedicineSkeleton />
<FormSkeleton />
```

**Variants**:
- `CardSkeleton` - Product/medicine card skeleton
- `ListSkeleton` - Multiple list items with staggered animation
- `MedicineSkeleton` - Medicine-specific skeleton
- `FormSkeleton` - Form field skeleton

**Features**:
- Entrance animation with staggered items
- Continuous pulse animation for visual feedback
- Smooth fade-in (0.3s) with Y-axis offset
- Dark mode compatible
- Responsive layout

---

### 4. **PageTransition** - Route Transitions
Wrapper component for smooth page transitions.

**Location**: `/src/components/PageTransition.jsx`

**Usage**:
```jsx
import { PageTransition } from './components/PageTransition';

<PageTransition variant="slide">
  <YourPageContent />
</PageTransition>
```

**Variants**:
- `default` - Fade + Vertical slide (up 20px)
- `slide` - Horizontal slide from right
- `fade` - Fade only

**Features**:
- Entrance animation (.4s) on page load
- Exit animation (.3s) on page change
- Smooth scroll-to-top integration
- AnimatePresence for route transitions
- Custom easing functions

---

## Custom Hooks (useAnimations)

**Location**: `/src/utils/useAnimations.js`

### Available Hooks:

#### 1. **useCardHover()**
Returns state and handlers for card hover lift animation.

```jsx
const { isHovered, onMouseEnter, onMouseLeave, animate } = useCardHover();
```

#### 2. **usePageTransition()**
Manages page transition state and scroll behavior.

```jsx
const { isLoading, withTransition } = usePageTransition();

const handleNavigate = withTransition(async () => {
  await navigateToPage();
});
```

#### 3. **useNumberAnimation(target, duration)**
Animate from 0 to target value with easing.

```jsx
const counter = useNumberAnimation(1254, 2000);

return <span>{counter}</span>;
```

#### 4. **useScrollDetection(handleScroll, debounceMs)**
Detect scroll events with debouncing.

```jsx
const { isScrolling } = useScrollDetection(() => {
  console.log('Page scrolled!');
}, 100);
```

#### 5. **useAnimationState(initialState)**
Manage animation playback state.

```jsx
const { isAnimating, start, stop, toggle } = useAnimationState(false);
```

#### 6. **useStaggerAnimation(itemIndex, delayBetweenMs)**
Calculate delay for staggered list animations.

```jsx
const delay = useStaggerAnimation(index, 50);
```

#### 7. **useFadeInAnimation(duration)**
Pre-configured fade-in animation variants.

```jsx
const fadeVariants = useFadeInAnimation(0.5);

<motion.div variants={fadeVariants}>Content</motion.div>
```

#### 8. **useSlideAnimation(direction, distance, duration)**
Pre-configured slide animation variants.

```jsx
const slideVariants = useSlideAnimation('up', 20, 0.5);
```

#### 9. **useScaleAnimation(duration, initialScale)**
Pre-configured scale animation variants.

```jsx
const scaleVariants = useScaleAnimation(0.3, 0.8);
```

#### 10. **useRotationAnimation(duration, infinite)**
Pre-configured rotation animation variants.

```jsx
const spinVariants = useRotationAnimation(2, true);
```

#### 11. **useMultipleAnimations(...names)**
Manage multiple animation states simultaneously.

```jsx
const { states, setState, toggle } = useMultipleAnimations('cardHover', 'menuOpen');
```

---

## Pre-configured Animation Variants

**Location**: `/src/utils/useAnimations.js` - `animationVariants` object

Exported variants ready to use with Framer Motion:

```jsx
import { animationVariants } from './utils/useAnimations';

// Fade animations
animationVariants.fadeIn
animationVariants.fadeInSlow

// Slide animations
animationVariants.slideInUp
animationVariants.slideInDown
animationVariants.slideInLeft
animationVariants.slideInRight

// Scale animations
animationVariants.scaleIn
animationVariants.scaleInLarge

// Effects
animationVariants.bounce
animationVariants.pulse
animationVariants.shimmer
```

---

## Container & Item Variants for Lists

**Purpose**: For staggered animations in lists.

```jsx
import { staggerContainerVariants, staggerItemVariants } from './utils/useAnimations';

<motion.div variants={staggerContainerVariants} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.div key={item.id} variants={staggerItemVariants}>
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

---

## Integration Examples

### Example 1: Dashboard with Animated Cards
```jsx
import AnimatedCard from './components/AnimatedCard';
import { staggerContainerVariants, staggerItemVariants } from './utils/useAnimations';
import { motion } from 'framer-motion';

export function Dashboard() {
  const cards = [...];

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card) => (
        <motion.div key={card.id} variants={staggerItemVariants}>
          <AnimatedCard variant="medium">
            <h3>{card.title}</h3>
            <p>{card.value}</p>
          </AnimatedCard>
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Example 2: Async Data Loading with Skeleton
```jsx
import { useState, useEffect } from 'react';
import { CardSkeleton } from './components/LoadingSkeletons';

export function DataPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData().then((result) => {
      setData(result);
      setLoading(false);
    });
  }, []);

  return loading ? <CardSkeleton /> : <div>{/* Your data here */}</div>;
}
```

### Example 3: Form with Ripple Buttons
```jsx
import RippleButton from './components/RippleButton';

export function Form() {
  return (
    <form>
      {/* Form fields */}
      <RippleButton variant="primary" type="submit">
        Submit
      </RippleButton>
      <RippleButton variant="secondary" type="reset">
        Clear
      </RippleButton>
    </form>
  );
}
```

### Example 4: Page Navigation with Transition
```jsx
import { PageTransition } from './components/PageTransition';

export function App() {
  return (
    <Routes>
      <Route path="/home" element={<PageTransition><Home /></PageTransition>} />
      <Route path="/search" element={<PageTransition variant="slide"><Search /></PageTransition>} />
    </Routes>
  );
}
```

---

## CSS Classes & Customization

All components export CSS classes for additional styling:

### AnimatedCard
- `.animated-card` - Base class
- `.animated-card--subtle` - Subtle variant
- `.animated-card--medium` - Medium variant
- `.animated-card--strong` - Strong variant

### RippleButton
- `.ripple-btn` - Base button
- `.ripple-btn--primary` - Primary variant
- `.ripple-btn--secondary` - Secondary variant
- `.ripple-btn--success` - Success variant
- `.ripple-btn--danger` - Danger variant
- `.ripple-btn--warning` - Warning variant
- `.ripple-btn--ghost` - Ghost variant
- `.ripple-btn__content` - Inner content wrapper

### LoadingSkeletons
- `.medicine-skeleton` - Medicine skeleton
- `.card-skeleton` - Card skeleton
- `.list-skeleton` - List skeleton
- `.form-skeleton` - Form skeleton
- `.skeleton-line` - Line element
- `.skeleton-image` - Image placeholder

---

## Performance Considerations

1. **GPU Acceleration**: All animations use `will-change: transform, box-shadow` for better performance
2. **Stagger Delays**: Limited to 0.1s between items to avoid lag
3. **Debouncing**: Scroll detection uses debouncing to prevent excessive re-renders
4. **Optimized Renders**: AnimatedCard uses Framer Motion's `motion.div` for optimized DOM updates

---

## Dark Mode Support

All components automatically adapt to dark mode set via `data-theme` attribute:

```jsx
// In ThemeContext or App.jsx
document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
```

Styles automatically apply dark mode variants:
- Button colors adjust
- Card backgrounds change
- Text contrast optimized
- Shadow colors darken

---

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (with -webkit prefixes)
- Mobile browsers: ✅ Full support

---

## Demo Component

View all animations in action:

```jsx
import MicroAnimationsDemo from './components/MicroAnimationsDemo';

<MicroAnimationsDemo />
```

This component showcases:
- All card hover variants
- All button variants
- Loading skeletons
- Hook usage examples

---

## Troubleshooting

### Ripple effect not appearing:
- Ensure parent button has `position: relative`
- Check that `overflow: hidden` is applied
- Verify Framer Motion is installed

### Cards not lifting on hover:
- Check `onMouseEnter` and `onMouseLeave` handlers are fired
- Verify CSS pointer-events is not disabled
- Ensure Framer Motion `animate` props are applied

### Skeletons not pulsing:
- Check that `pulseVariants` animation is running
- Ensure Framer Motion is installed
- Verify browser supports CSS animations

---

## Next Steps

1. **Replace existing loaders**: Update components currently using CSS spinners
2. **Wrap route components**: Apply PageTransition to all routes in App.jsx
3. **Update buttons**: Replace old buttons with RippleButton
4. **Enhance cards**: Wrap existing cards with AnimatedCard
5. **Monitor performance**: Use React DevTools to check for unnecessary re-renders

---

## Framer Motion Documentation

For more advanced animations, refer to:
- [Framer Motion Official Docs](https://www.framer.com/motion/)
- Variants and Gestures documentation
- Animation types (spring, tween, inertia)

---

**Phase 6 Status**: ✅ Complete
- LoadingSkeletons enhanced with animations
- RippleButton implemented
- PageTransition wrapper created
- AnimatedCard with hover effects
- 11 custom animation hooks
- Pre-configured animation variants
- Full dark mode support
- Comprehensive integration guide

