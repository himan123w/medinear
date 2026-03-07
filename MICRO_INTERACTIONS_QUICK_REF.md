# 🎯 Micro-Interactions Quick Reference

## TL;DR
Premium subtle animations are now available throughout the app. Just add the right CSS classes!

## 🚀 Quick Usage

### Fade-in Animations
```jsx
// Basic fade-in
<div className="fade-in">Content</div>

// Fade-in with upward motion
<div className="fade-in-up">Content</div>

// Fade-in with scale
<div className="fade-in-scale">Content</div>

// Staggered list items (auto-delays children)
<div className="fade-in-stagger">
  <div>Item 1</div>  {/* Delays 0.05s */}
  <div>Item 2</div>  {/* Delays 0.1s */}
  <div>Item 3</div>  {/* Delays 0.15s */}
</div>
```

### Card Lift Effects
```jsx
// Add 'card' class to any element for lift effect
<div className="card">
  Your content
</div>

// Works with existing classes too
<div className="pharmacy-card card">
  Pharmacy info
</div>
```

### Buttons
Buttons automatically have glow effects! Just use standard classes:
```jsx
<button className="btn btn-primary">Click me</button>
<button className="btn btn-success">Success</button>
<button className="btn btn-danger">Delete</button>
```

### Smooth Transitions
```jsx
// Add smooth transition to any element
<div className="smooth-transition">Content</div>

// Bounce effect
<div className="smooth-bounce">Content</div>
```

### Hover Effects
```jsx
// Brighten on hover
<img className="hover-brighten" src="..." />

// Scale on hover
<div className="hover-scale">Content</div>

// Fade opacity on hover
<div className="fade-opacity">Content</div>
```

### Slides
```jsx
// Slide in from right
<div className="slide-in-right">Content</div>

// Slide in from left
<div className="slide-in-left">Content</div>
```

### Ripple Effect
```jsx
// Add ripple click effect
<button className="ripple-effect">Click me</button>
```

### Loading States
```html
<!-- Skeletons automatically shimmer -->
<div className="skeleton-line"></div>
<div className="skeleton-image"></div>
<div className="skeleton-text"></div>

<!-- Loading spinner -->
<div className="spinner">⟳</div>
```

## 💡 Pro Tips

### Combine Classes
```jsx
<div className="card fade-in hover-scale">
  Combines lift, fade-in, and scale effects!
</div>
```

### Results Lists
```jsx
{results.map(item => (
  <div key={item.id} className="result-card fade-in-up">
    {item.content}
  </div>
))}
```

### Search Results Pattern
```jsx
{medicines.length > 0 && (
  <div className="results-section fade-in">
    <h2>Results</h2>
    <div className="medicines-grid fade-in-stagger">
      {medicines.map(medicine => (
        <MedicineCard 
          key={medicine._id} 
          className="card"
          medicine={medicine} 
        />
      ))}
    </div>
  </div>
)}
```

## 🎨 CSS Variables

Customize animations in your CSS:
```css
:root {
  --transition-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --shadow-glow-primary: 0 0 20px rgba(102, 126, 234, 0.4);
  --shadow-glow-success: 0 0 20px rgba(76, 175, 80, 0.4);
  --shadow-glow-danger: 0 0 20px rgba(244, 67, 54, 0.4);
}
```

## ⚡ Performance

All animations use GPU-accelerated properties:
- `transform` ✅
- `opacity` ✅
- `box-shadow` ⚠️ (used sparingly)

Avoid animating:
- `width`, `height` ❌
- `top`, `left` ❌
- `margin`, `padding` ❌

## 📱 Mobile Considerations

All animations are touch-friendly:
- Hover effects work with `:active` on mobile
- Reduced motion respected automatically
- Optimized for 60fps on mobile devices

## 🔍 Examples in Codebase

Check these files for reference:
- `src/components/MedicineSearchWithReserve.jsx` - Fade-in results
- `src/pages/Home.css` - Card animations
- `src/pages/Dashboard.css` - Stat card lifts
- `src/components/LoadingSkeletons.css` - Shimmer effects

## 🎯 Common Patterns

### Pattern 1: Animated List
```jsx
<div className="list-container fade-in-stagger">
  {items.map(item => (
    <div key={item.id} className="list-item card">
      {item.content}
    </div>
  ))}
</div>
```

### Pattern 2: Hero Section
```jsx
<div className="hero fade-in-scale">
  <h1 className="slide-in-left">Welcome</h1>
  <p className="slide-in-right">Subtitle</p>
</div>
```

### Pattern 3: Stats Grid
```jsx
<div className="stats-grid fade-in-stagger">
  <div className="stat-card card">
    <h3>100+</h3>
    <p>Users</p>
  </div>
  {/* More stats... */}
</div>
```

### Pattern 4: Modal Entry
```jsx
{showModal && (
  <div className="modal fade-in-scale">
    <div className="modal-content">
      {/* Content */}
    </div>
  </div>
)}
```

## 🐛 Troubleshooting

### Animation not working?
1. Check if `animations.css` is imported in `main.jsx`
2. Verify class name spelling
3. Check for CSS conflicts
4. Clear browser cache

### Animation too slow/fast?
Override in your component CSS:
```css
.my-component.fade-in {
  animation-duration: 0.2s; /* Faster */
}
```

### Disable for specific element?
```css
.no-animation {
  animation: none !important;
  transition: none !important;
}
```

## 🎉 That's It!

Just add the classes and enjoy premium micro-interactions throughout your app!

---
**Need more info?** See `MICRO_INTERACTIONS_GUIDE.md` for full documentation.
