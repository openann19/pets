# 🎬 Jawdrops — Animations & Effects Catalog

**One place to understand, use, and extend every motion/FX primitive in PawfectMatch.**

Targets buttery-smooth UX with stable hooks, strict types, and zero lint violations.

---

## 0) Quick Map

### Design Tokens & Globals
- `UltraGlobalStyles.ts` → `AnimationConfigs`, `Shadows`, `Colors`, `Typography`
- `makeShadow(level, color?)` → consistent drop shadows (iOS + web)

### Motion Helpers / Primitives
- `src/components/ui/motion-helper.tsx` → `<MotionFade/>`, `<MotionScale/>`
- `src/components/animations/index.tsx` → shared variants, enter/exit transitions

### Feature Animations
- **Swipe**: `src/components/ui/MobileSwipeCard.tsx`, `src/hooks/useSwipe.ts`
- **Like burst**: `src/components/ui/LikeAnimation.tsx`
- **Loading**: `src/components/ui/LoadingSpinner.tsx`, `src/components/ui/UniversalLoadingStates.tsx`
- **Pull-to-refresh**: `src/components/ui/PullToRefresh.tsx`
- **Typing dots**: `src/components/chat/TypingIndicator.tsx`

### System Hooks (Motion & Gestures)
- `src/hooks/useAdvancedGestures.ts`
- `src/utils/mobile-gestures.ts`
- `src/utils/mobile-analytics.ts` (motion-related telemetry)

---

## 1) Tokens & Base Configs

### Shadows (Drop Shadows, Consistent Per Platform)

```typescript
// UltraGlobalStyles.ts
export const makeShadow = (level: 1|2|3|4|5, color = Colors.gray900) => ({
  // iOS + web shadow
  shadowColor: color,
  shadowOffset: { width: 0, height: level * 2 },
  shadowOpacity: 0.1 + level * 0.05,
  shadowRadius: level * 3,
});

export const Shadows = {
  sm: makeShadow(1),
  md: makeShadow(2),
  lg: makeShadow(3),
  xl: makeShadow(4),
  '2xl': makeShadow(5),
};
```

**Use**: cards, popovers, pressed/hover states.

### AnimationConfigs (Central Timing)

```typescript
export const AnimationConfigs = {
  spring:        { damping: 20, stiffness: 400, mass: 0.8 },
  springGentle:  { damping: 25, stiffness: 300, mass: 1.0 },
  springBouncy:  { damping: 15, stiffness: 500, mass: 0.6 },
  timing:        { duration: 600, easing: EASING_BEZIER },
  timingFast:    { duration: 300, easing: EASING_BEZIER },
  timingSlow:    { duration: 800, easing: EASING_BEZIER },
} as const;
```

**Guideline**:
- Gestures → `spring` / `springBouncy`
- Micro-interactions (buttons, chips) → `timingFast`
- Page/section transitions → `timing`

---

## 2) Re-usable Motion Primitives

### `<MotionFade />`

**File**: `src/components/ui/motion-helper.tsx`

**Props**: all `motion.div` props + `in?: boolean` + `duration?: number`

**Behavior**: opacity from `0→1` on mount; honors exit if wrapped in `AnimatePresence`.

```typescript
<MotionFade in>
  <Card>Content</Card>
</MotionFade>
```

### `<MotionScale />`

**Behavior**: subtle scale (`0.96→1`) + fade

**Use**: popovers, tooltips, menus.

```typescript
<MotionScale in>
  <Menu />
</MotionScale>
```

**Note**: Both components have explicit `displayName` to satisfy `react/display-name` lint rule.

---

## 3) Shared Variants (Enter/Exit, Slide, Lift)

**File**: `src/components/animations/index.tsx`

```typescript
export const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit:    { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: 16 },
  },
  slideRight: {
    initial: { opacity: 0, x: -16 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -16 },
  },
  lift: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1.0 },
    exit:    { opacity: 0, scale: 0.98 },
  },
} as const;
```

**Usage**:

```typescript
<motion.div
  variants={variants.slideUp}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={{ type: 'spring', ...AnimationConfigs.spring }}
/>
```

---

## 4) Feature Animations

### 4.1 Swipe Card (Tinder-style)

**Files**: `src/components/ui/MobileSwipeCard.tsx`, `src/hooks/useSwipe.ts`

**Core Ideas**:
- Pan gesture → `transform` (translateX/rotate)
- Velocity threshold → fling off-screen
- Haptics (optional)

**Performance**: only `transform` + `opacity`; no reflow.

```typescript
<motion.div
  style={{ x, rotate, scale }}
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  onDragEnd={onSwipeEnd}
  transition={{ type: 'spring', ...AnimationConfigs.springBouncy }}
/>
```

### 4.2 Like Burst

**File**: `src/components/ui/LikeAnimation.tsx`

**Effect**: heart burst + particles on like action.

```typescript
const burst = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
};

<motion.div variants={burst} initial="initial" animate="animate" />
```

**Lint notes**: escape entities (`It&apos;s`) & keep variants outside render.

### 4.3 Loading & Skeletons

**Files**: `LoadingSpinner.tsx`, `UniversalLoadingStates.tsx`

- **Spinner**: pure CSS rotate (GPU-friendly)
- **Skeletons**: pulsing gradient with `prefers-reduced-motion` awareness

### 4.4 Pull-to-Refresh

**File**: `src/components/ui/PullToRefresh.tsx`

**Fix Applied**: Hooks at top-level; compute transforms unconditionally; guard rendering only.

```typescript
// Top-level
const { scrollY } = useScroll();
const pullOpacity = useTransform(scrollY, [0, 150], [0, 1], { clamp: true });

// In JSX
{enabled ? <motion.div style={{ opacity: pullOpacity }} /> : null}
```

### 4.5 Typing Indicator (Chat)

**File**: `src/components/chat/TypingIndicator.tsx`

**Effect**: 3 dots scale/opacity stagger; consider swapping `<img>` → `next/image` (already lint-hinted).

---

## 5) Gesture & Analytics Helpers

### 5.1 `useAdvancedGestures`

**File**: `src/hooks/useAdvancedGestures.ts`

**Rule**: config object must be memoized to avoid deps churn.

```typescript
const finalConfig = useMemo(() => ({
  // use plain scalars here
}), [/* scalar deps only */]);

const onPan = useCallback((e) => {
  // ...use finalConfig...
}, [finalConfig]);
```

### 5.2 `mobile-gestures` / `mobile-analytics`

**Files**: `src/utils/mobile-gestures.ts`, `src/utils/mobile-analytics.ts`

**Rules Enforced**:
- No conditional hooks
- Extract complex deps to variables
- Memoize big configs before `useCallback`/`useEffect`

---

## 6) Accessibility & DOM Typing (For Animated UIs)

**Where**: `src/utils/mobile-accessibility.ts`

**Change**: `Element[]` → `HTMLElement[]` to satisfy state shape.

```typescript
const nodes = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
setState(prev => ({ ...prev, focusableElements: nodes }));
```

Or guard:

```typescript
const isHTMLElement = (el: Element): el is HTMLElement => el instanceof HTMLElement;
const els = raw.filter(isHTMLElement);
```

---

## 7) Performance Budget (60 FPS Checklist)

- ✅ Use `transform`/`opacity` only; avoid `top`/`left`/`width`/`height`
- ✅ Keep layers lean (avoid massive `box-shadow` + blurs on large nodes)
- ✅ Reuse `AnimationConfigs`; keep durations short (150–300ms for micro)
- ✅ Use `will-change: transform;` sparingly (only for frequently animated nodes)
- ✅ Respect reduced motion:
  - Read via `usePrefersReducedMotion` (if present) or CSS media query
  - Switch to instant or faded transitions for users who prefer it
- ✅ Heavy lists: virtualize (windowing) before adding per-row motion

---

## 8) Do / Don't

### ✅ Do

- Export variants and config outside components
- Memoize config objects passed into hooks
- Wrap leave animations with `AnimatePresence`
- Use `displayName` on motion components
- Escape JSX entities (`&apos;`, `&quot;`, etc.)

### ❌ Don't

- Call hooks conditionally
- Animate layout props that cause reflow
- Depend on unstable objects/functions in `useEffect`/`useCallback`
- Use `@ts-ignore` (use `@ts-expect-error` if needed)
- Leave unused variables (prefix with `_` if intentional)

---

## 9) Adding a New Animation

### Step 1: Decide Level

- **Primitive** → add to `motion-helper.tsx`
- **Reusable pattern** → add to `components/animations/index.tsx`
- **Feature-specific** → co-locate with the feature component/hook

### Step 2: Create Variants Outside Render

```typescript
const myVariants = {
  initial: { /* ... */ },
  animate: { /* ... */ },
  exit: { /* ... */ },
};
```

### Step 3: Use `AnimationConfigs`

No ad-hoc timings unless justified:

```typescript
transition={{ type: 'spring', ...AnimationConfigs.spring }}
```

### Step 4: Lint/TS

- No unsafe calls
- No conditional hooks
- Escape JSX entities
- Add `displayName` if exporting a component

### Step 5: Test

- Snapshot for presence/exit
- Reduced-motion path renders without jank

---

## 10) File Index (Quick Lookup)

| File | Purpose |
|------|---------|
| `src/components/ui/motion-helper.tsx` | `MotionFade`, `MotionScale` (with `displayName`) |
| `src/components/animations/index.tsx` | Shared variants/presets |
| `src/components/ui/MobileSwipeCard.tsx` | Swipe card transforms |
| `src/hooks/useSwipe.ts` | Swipe logic |
| `src/components/ui/LikeAnimation.tsx` | Heart/particles |
| `src/components/ui/LoadingSpinner.tsx` | Spinner |
| `src/components/ui/UniversalLoadingStates.tsx` | Skeletons |
| `src/components/ui/PullToRefresh.tsx` | Pull effect (fixed hook order) |
| `src/components/chat/TypingIndicator.tsx` | Chat dots |
| `src/hooks/useAdvancedGestures.ts` | Gesture config (memoization) |
| `src/utils/mobile-gestures.ts` | Gesture utilities |
| `src/utils/mobile-analytics.ts` | Motion telemetry |
| `src/styles/UltraGlobalStyles.ts` | `AnimationConfigs`, `Shadows`, tokens |

---

## Appendix A — Sample Presets

```typescript
// components/animations/index.tsx
export const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit:    { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: 16 },
  },
  slideRight: {
    initial: { opacity: 0, x: -16 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -16 },
  },
  lift: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1.0 },
    exit:    { opacity: 0, scale: 0.98 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1.0 },
    exit:    { opacity: 0, scale: 0.8 },
  },
  rotateIn: {
    initial: { opacity: 0, rotate: -10 },
    animate: { opacity: 1, rotate: 0 },
    exit:    { opacity: 0, rotate: 10 },
  },
} as const;
```

---

## Appendix B — Strict Lint Rules (Animation-Safe)

All animations must comply with:

- ✅ `@typescript-eslint/no-explicit-any` → use generics or `unknown`
- ✅ `@typescript-eslint/no-unsafe-*` → typed motion props
- ✅ `react-hooks/exhaustive-deps` → minimal, stable deps
- ✅ `react/display-name` → export components with `displayName`
- ✅ `no-console` → use logger, not `console.log`
- ✅ `no-unused-vars` → prefix with `_` if intentional

**No exceptions.** Animations are part of the strict baseline.

---

## Appendix C — Common Patterns

### Pattern 1: Conditional Rendering (Not Conditional Hooks)

```typescript
// ✅ GOOD
const { scrollY } = useScroll();
const opacity = useTransform(scrollY, [0, 100], [0, 1]);

return enabled ? <motion.div style={{ opacity }} /> : null;

// ❌ BAD
if (enabled) {
  const { scrollY } = useScroll(); // Conditional hook!
}
```

### Pattern 2: Memoized Config for Callbacks

```typescript
// ✅ GOOD
const config = useMemo(() => ({ x: 0, y: 0 }), []);
const onPan = useCallback((e) => { /* use config */ }, [config]);

// ❌ BAD
const onPan = useCallback((e) => {
  const config = { x: 0, y: 0 }; // New object every render!
}, []);
```

### Pattern 3: Escape JSX Entities

```typescript
// ✅ GOOD
<span>It&apos;s a match!</span>

// ❌ BAD
<span>It's a match!</span>
```

---

**Hand this to any new dev — they'll know where each animation lives, how to use it, and how to extend it without tripping strict lint/TS rules.**

🚀 Happy animating!
