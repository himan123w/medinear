# ✨ Micro-Animations Quick Reference

## Phase 6: Complete - Framer Motion Implementation

### Components Created

| Component | Purpose | Location | Status |
|-----------|---------|----------|--------|
| **AnimatedCard** | Hover lift effect | `components/AnimatedCard.jsx` | ✅ Complete |
| **RippleButton** | Click ripple effect | `components/RippleButton.jsx` | ✅ Complete |
| **LoadingSkeletons** | Enhanced pulse loaders | `components/LoadingSkeletons.jsx` | ✅ Enhanced |
| **PageTransition** | Route animations | `components/PageTransition.jsx` | ✅ Complete |
| **MicroAnimationsDemo** | Demo showcase | `components/MicroAnimationsDemo.jsx` | ✅ Complete |

### Custom Hooks (11 Total)

```js
import {
  useCardHover,           // Hover lift state
  usePageTransition,      // Page transition with scroll
  useNumberAnimation,     // Animated counter
  useScrollDetection,     // Scroll event handler
  useAnimationState,      // Play/pause animation
  useStaggerAnimation,    // List item stagger delay
  useFadeInAnimation,     // Pre-configured fade
  useSlideAnimation,      // Pre-configured slide
  useScaleAnimation,      // Pre-configured scale
  useRotationAnimation,   // Pre-configured rotation
  useMultipleAnimations,  // Multiple state tracking
  animationVariants,      // Motion variants export
  staggerContainerVariants,  // List container
  staggerItemVariants     // List item
} from './utils/useAnimations';
```

### Quick Usage

#### 1. Card Hover Lift
```jsx
import AnimatedCard from './components/AnimatedCard';

<AnimatedCard variant="medium">
  <h3>Title</h3>
  <p>Content</p>
</AnimatedCard>
```

**Variants**: `subtle` | `medium` | `strong`

#### 2. Ripple Button
```jsx
import RippleButton from './components/RippleButton';

<RippleButton variant="primary" size="md" onClick={handleClick}>
  Click Me
</RippleButton>
```

**Variants**: `primary` | `secondary` | `success` | `danger` | `warning` | `ghost`
**Sizes**: `xs` | `sm` | `md` | `lg`

#### 3. Loading Skeleton
```jsx
import { CardSkeleton, ListSkeleton } from './components/LoadingSkeletons';

{loading ? <CardSkeleton /> : <Content />}
```

**Types**: `CardSkeleton` | `ListSkeleton` | `MedicineSkeleton` | `FormSkeleton`

#### 4. Page Transition
```jsx
import { PageTransition } from './components/PageTransition';

<PageTransition variant="slide">
  <PageContent />
</PageTransition>
```

**Variants**: `default` | `slide` | `fade`

#### 5. List Animation
```jsx
import { motion } from 'framer-motion';
import { staggerContainerVariants, staggerItemVariants } from './utils/useAnimations';

<motion.div variants={staggerContainerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.div key={item.id} variants={staggerItemVariants}>
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

### Pre-configured Variants

```js
animationVariants.fadeIn          // Quick fade (0.3s)
animationVariants.fadeInSlow      // Slow fade (0.6s)
animationVariants.slideInUp       // Slide from bottom
animationVariants.slideInDown     // Slide from top
animationVariants.slideInLeft     // Slide from left
animationVariants.slideInRight    // Slide from right
animationVariants.scaleIn         // Scale from 0.9
animationVariants.scaleInLarge    // Scale from 0.5
animationVariants.bounce          // Bounce effect
animationVariants.pulse           // Pulsing scale
animationVariants.shimmer         // Shimmer/loading
```

### CSS Classes

```css
/* AnimatedCard */
.animated-card
.animated-card--subtle
.animated-card--medium
.animated-card--strong

/* RippleButton */
.ripple-btn
.ripple-btn--primary
.ripple-btn--secondary
.ripple-btn--success
.ripple-btn--danger
.ripple-btn--warning
.ripple-btn--ghost
.ripple-btn--xs / --sm / --md / --lg

/* LoadingSkeletons */
.skeleton-card
.skeleton-image
.skeleton-line
.skeleton-content

/* PageTransition */
.page-transition
```

### Animations Timeline

| Component | Duration | Easing |
|-----------|----------|--------|
| Card hover | 0.3s | easeOut |
| Ripple effect | 0.6s | easeOut |
| Skeleton pulse | 1.5s | easeInOut (repeat) |
| Page entrance | 0.4s | easeOut |
| Page exit | 0.3s | easeIn |
| Stagger gap | 0.1s | - |

### Integration Checklist

- [ ] Install dependencies: `npm install` in medinear-frontend
- [ ] Import and use AnimatedCard in MedicineCard, DataPanel, pharmacy cards
- [ ] Replace all buttons with RippleButton
- [ ] Wrap routes with PageTransition in App.jsx
- [ ] Replace loading spinners with appropriate skeleton components
- [ ] Use usePageTransition hook for navigation
- [ ] Apply stagger animations to lists and grids
- [ ] Test in dark mode
- [ ] Test on mobile devices

### Dark Mode Support

All components automatically adapt to dark mode:
```jsx
// Automatically detects [data-theme="dark"] attribute
// Styling adapts automatically
```

### Performance Tips

1. Use `will-change` CSS property (already included)
2. Limit stagger delays to 0.1s-0.2s
3. Chain animations with `transition.delay`
4. Use key prop on repeated elements
5. Debounce scroll handlers (0.1s default)

### File Summary

**Components**: 5 files (JSX + CSS pairs)
- AnimatedCard (2 files)
- RippleButton (2 files)
- PageTransition (2 files)
- LoadingSkeletons (enhanced existing)
- MicroAnimationsDemo (2 files)

**Utils**: 1 file
- useAnimations.js (11 hooks + variants)

**Docs**: 2 files
- MICRO_ANIMATIONS_INTEGRATION.md (full guide)
- MICRO_ANIMATIONS_QUICK_REF.md (this file)

**Total new code**: ~2,400 lines

### Common Patterns

**Animated List**:
```jsx
<motion.div variants={staggerContainerVariants} initial="hidden" animate="visible">
  {items.map((item, i) => (
    <motion.div key={i} variants={staggerItemVariants}>
      <AnimatedCard>{item}</AnimatedCard>
    </motion.div>
  ))}
</motion.div>
```

**Form with Loading**:
```jsx
const [loading, setLoading] = useState(false);

{loading ? (
  <FormSkeleton />
) : (
  <form>
    {/* inputs */}
    <RippleButton type="submit">Submit</RippleButton>
  </form>
)}
```

**Navigation with Transition**:
```jsx
<Routes>
  <Route path="/" element={<PageTransition><Home /></PageTransition>} />
  <Route path="/search" element={<PageTransition variant="slide"><Search /></PageTransition>} />
</Routes>
```

### Error Handling

**If ripple doesn't show**: Check button `overflow: hidden` and `position: relative`
**If cards don't lift**: Verify `onMouseEnter/Leave` handlers and no CSS `pointer-events: none`
**If skeletons don't pulse**: Ensure Framer Motion is installed in node_modules

### Browser Support

✅ Chrome/Edge v88+
✅ Firefox v87+
✅ Safari v14+
✅ Mobile browsers (iOS Safari, Chrome Android)

### Dependencies

- `framer-motion`: ^10.16.0 (added to package.json)
- `react`: ^19.2.0 (already included)

### Next Phase

After integration:
1. Monitor performance with React DevTools
2. Gather user feedback on micro-interactions
3. Consider adding haptic feedback on mobile
4. Expand animation library for other components
5. Create animation theme customization

---

**Status**: ✅ Phase 6 Complete
**Files Created/Modified**: 11
**Total Lines Added**: ~2,400
**Components Ready**: 5
**Hooks Available**: 11
**Pre-configured Variants**: 11+

