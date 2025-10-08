# VeridiaApp Component Guide

## Overview

This guide provides standardized UI components for building consistent, accessible, and performant interfaces across VeridiaApp. All components follow the design system defined in [DESIGN.md](./DESIGN.md).

---

## Buttons

### Primary Button

**Use for**: Main actions, CTAs, form submissions

```tsx
<button
  className="px-8 py-4 rounded-lg font-semibold transition-all btn-hover"
  style={{ 
    backgroundColor: '#0A7FFF',
    color: 'white',
    boxShadow: '0 4px 6px rgba(10, 127, 255, 0.25)'
  }}
>
  Get Started Free →
</button>
```

**States:**
- Default: Blue background, white text, shadow
- Hover: Scale 1.02, opacity 0.9
- Active: Scale 0.98
- Disabled: Gray background, opacity 0.5
- Loading: Spinner + 50% text opacity

### Secondary Button

**Use for**: Less important actions, cancel buttons

```tsx
<button
  className="px-8 py-4 rounded-lg border-2 font-semibold transition-all btn-hover"
  style={{ 
    borderColor: '#0A7FFF',
    color: '#0A7FFF'
  }}
>
  Learn More
</button>
```

### Icon Button

**Use for**: Actions with icon only (must have aria-label)

```tsx
<button
  className="p-3 rounded-lg transition-all btn-hover"
  aria-label="Close modal"
  style={{ 
    backgroundColor: '#F3F4F6',
    color: '#374151'
  }}
>
  ✕
</button>
```

---

## Cards

### Content Card

**Use for**: Displaying content items, search results

```tsx
<div 
  className="p-6 md:p-8 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover-lift transition-all"
  style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}
>
  {/* Status badges */}
  <div className="flex items-center gap-2 mb-4">
    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700">
      📂 Category
    </span>
    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
      ✓ Verified
    </span>
  </div>
  
  {/* Title */}
  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
    Content Title
  </h3>
  
  {/* Description */}
  <p className="text-base text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
    Content description goes here...
  </p>
  
  {/* Footer */}
  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
    <span>👤 Author Name</span>
    <span>📅 Jan 15, 2025</span>
  </div>
</div>
```

### Feature Card

**Use for**: Showcasing features, benefits

```tsx
<div 
  className="p-6 md:p-8 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover-lift"
  style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}
>
  {/* Icon */}
  <div 
    className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl mb-4 bg-blue-50 dark:bg-blue-900/30"
  >
    ✓
  </div>
  
  {/* Title */}
  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
    Feature Title
  </h3>
  
  {/* Description */}
  <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
    Feature description explaining the benefit to users.
  </p>
</div>
```

---

## Badges & Status Indicators

### Status Badge

**Use for**: Content verification status

```tsx
{/* Verified */}
<span className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
  ✓ Verified
</span>

{/* Disputed */}
<span className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
  ⚠ Disputed
</span>

{/* Pending */}
<span className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
  ⏱ Pending
</span>
```

### Category Badge

**Use for**: Content categories, tags

```tsx
<span className="px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
  📂 News
</span>
```

---

## Form Elements

### Text Input

**Use for**: Single-line text entry

```tsx
<div>
  <label 
    htmlFor="email" 
    className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
  >
    Email Address
  </label>
  <input
    type="email"
    id="email"
    name="email"
    placeholder="you@example.com"
    className="w-full px-5 py-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-lg transition-all"
    style={{ fontSize: '16px' }}
  />
</div>
```

**Accessibility:**
- Always use `<label>` with matching `for` attribute
- Use `aria-describedby` for helper text
- Use `aria-invalid` and `aria-errormessage` for errors

### Select Dropdown

**Use for**: Choosing from predefined options

```tsx
<div>
  <label 
    htmlFor="category" 
    className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
  >
    📂 Category
  </label>
  <select
    id="category"
    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
  >
    <option value="">All Categories</option>
    <option value="news">News</option>
    <option value="science">Science</option>
  </select>
</div>
```

### Textarea

**Use for**: Multi-line text entry

```tsx
<div>
  <label 
    htmlFor="description" 
    className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300"
  >
    Description
  </label>
  <textarea
    id="description"
    rows={4}
    placeholder="Enter a detailed description..."
    className="w-full px-5 py-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-lg transition-all resize-vertical"
    style={{ fontSize: '16px' }}
  />
</div>
```

---

## Loading States

### Skeleton Screen

**Use for**: Content loading placeholders

```tsx
{/* Single skeleton */}
<div className="skeleton h-32 rounded-xl"></div>

{/* Multiple skeletons */}
<div className="space-y-4">
  {[1, 2, 3].map((i) => (
    <div key={i} className="skeleton h-32 rounded-xl"></div>
  ))}
</div>
```

### Loading Spinner

**Use for**: Button loading states

```tsx
<button
  disabled
  className="px-8 py-4 rounded-lg font-semibold"
  style={{ backgroundColor: '#9CA3AF', color: 'white' }}
>
  <span className="flex items-center justify-center gap-2">
    <span className="spinner"></span>
    Loading...
  </span>
</button>
```

### Progress Bar (Future)

**Use for**: Upload progress, multi-step forms

```tsx
<div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
  <div 
    className="h-full bg-blue-500 transition-all duration-300"
    style={{ width: '60%' }}
  />
</div>
```

---

## Alerts & Messages

### Error Alert

**Use for**: Error messages, validation failures

```tsx
<div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 animate-shake">
  <div className="flex items-center gap-2">
    <span className="text-xl">⚠️</span>
    <span className="font-medium">Error message here</span>
  </div>
</div>
```

### Success Alert

**Use for**: Success confirmations

```tsx
<div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 animate-fadeIn">
  <div className="flex items-center gap-2">
    <span className="text-xl">✓</span>
    <span className="font-medium">Success message here</span>
  </div>
</div>
```

### Info Alert

**Use for**: Informational messages, tips

```tsx
<div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
    <span className="text-xl">💡</span>
    <span className="font-semibold">Information message here</span>
  </div>
</div>
```

---

## Navigation

### Mobile Bottom Navigation

**Use for**: Mobile primary navigation

```tsx
<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40">
  <div className="flex justify-around items-center px-4 py-2">
    <a href="/" className="flex flex-col items-center gap-1 p-2 min-w-[60px]">
      <span className="text-xl">🏠</span>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Home</span>
    </a>
    <a href="/discovery" className="flex flex-col items-center gap-1 p-2 min-w-[60px]">
      <span className="text-xl">🔍</span>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Discover</span>
    </a>
    <a href="/create" className="flex flex-col items-center gap-1 p-2 min-w-[60px] -mt-6">
      <div 
        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg"
        style={{ backgroundColor: '#0A7FFF' }}
      >
        <span style={{ color: 'white' }}>+</span>
      </div>
      <span className="text-xs font-medium mt-1 text-gray-600 dark:text-gray-400">Create</span>
    </a>
    <a href="/activity" className="flex flex-col items-center gap-1 p-2 min-w-[60px]">
      <span className="text-xl">💬</span>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Activity</span>
    </a>
    <a href="/profile" className="flex flex-col items-center gap-1 p-2 min-w-[60px]">
      <span className="text-xl">👤</span>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Profile</span>
    </a>
  </div>
</nav>
```

### Sticky Header

**Use for**: Top navigation (desktop & mobile)

```tsx
<header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg">
  <nav className="container mx-auto px-4 py-4 md:px-6">
    <div className="flex items-center justify-between">
      {/* Logo */}
      <a 
        href="/" 
        className="text-xl md:text-2xl font-bold hover:opacity-80 transition-opacity flex items-center gap-2"
        style={{ color: '#0A7FFF' }}
      >
        <span className="text-2xl">✓</span>
        <span>VeridiaApp</span>
      </a>
      
      {/* Navigation */}
      <div className="hidden md:flex items-center gap-6">
        <a href="/discovery" className="text-base font-medium hover:opacity-80">
          Discover
        </a>
        <a href="/create" className="text-base font-medium hover:opacity-80">
          Create
        </a>
      </div>
      
      {/* Auth Buttons */}
      <div className="flex gap-3">
        <a href="/login" className="px-4 py-2 rounded-lg text-sm font-medium btn-hover">
          Sign In
        </a>
        <a href="/register" className="px-4 py-2 rounded-lg text-sm font-medium btn-hover">
          Get Started
        </a>
      </div>
    </div>
  </nav>
</header>
```

---

## Typography

### Headings

```tsx
{/* Display - Hero titles */}
<h1 className="text-4xl md:text-6xl font-bold" style={{ letterSpacing: '-0.02em' }}>
  Display Heading
</h1>

{/* H1 - Page titles */}
<h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
  Page Title with Gradient
</h1>

{/* H2 - Section titles */}
<h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
  Section Title
</h2>

{/* H3 - Subsection titles */}
<h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
  Subsection Title
</h3>
```

### Body Text

```tsx
{/* Primary body text */}
<p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
  Main body content with comfortable line height.
</p>

{/* Secondary text */}
<p className="text-sm text-gray-500 dark:text-gray-500">
  Secondary information, captions, helper text.
</p>

{/* Small text */}
<p className="text-xs text-gray-400 dark:text-gray-600">
  Very small text for fine print.
</p>
```

### Code & Technical

```tsx
{/* Inline code */}
<code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono text-gray-800 dark:text-gray-200">
  inline_code()
</code>

{/* Code block */}
<pre className="p-4 rounded-lg bg-gray-900 dark:bg-black overflow-x-auto">
  <code className="text-sm font-mono text-gray-100">
    const example = "code block";
  </code>
</pre>
```

---

## Empty States

### No Results

**Use for**: Empty search results, no content

```tsx
<div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 animate-fadeIn">
  <div className="text-6xl mb-4">🔍</div>
  <p className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
    No results found
  </p>
  <p className="text-base text-gray-600 dark:text-gray-400">
    Try different keywords or remove filters
  </p>
</div>
```

### Getting Started

**Use for**: Onboarding, first-time user experience

```tsx
<div className="p-8 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
  <div className="flex items-start gap-4">
    <div className="text-4xl">💡</div>
    <div className="flex-1">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Getting Started
      </h3>
      <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
        Welcome message and instructions here...
      </p>
      <button className="px-6 py-3 rounded-lg bg-blue-500 text-white font-semibold btn-hover">
        Start Now
      </button>
    </div>
  </div>
</div>
```

---

## Animations

### Entrance Animations

```tsx
{/* Fade In */}
<div className="animate-fadeIn">Content</div>

{/* Slide In from Left */}
<div className="animate-slideInFromLeft">Content</div>

{/* Slide In from Right */}
<div className="animate-slideInFromRight">Content</div>

{/* Scale In */}
<div className="animate-scaleIn">Content</div>

{/* Bounce In */}
<div className="animate-bounceIn">Content</div>
```

### Staggered Animations

```tsx
<div className="space-y-4">
  <div className="animate-fadeIn delay-100">Item 1</div>
  <div className="animate-fadeIn delay-200">Item 2</div>
  <div className="animate-fadeIn delay-300">Item 3</div>
</div>
```

### Feedback Animations

```tsx
{/* Success animation */}
<button className="animate-verifySuccess">
  ✓ Verified
</button>

{/* Error shake */}
<div className="animate-shake">
  Error message
</div>

{/* Continuous pulse */}
<div className="animate-pulse">
  Loading...
</div>

{/* Spinning loader */}
<div className="animate-spin">
  ⟳
</div>
```

---

## Best Practices

### 1. Consistency
- Use the same component for the same purpose across the app
- Follow the spacing system (8px base unit)
- Maintain consistent color usage

### 2. Accessibility
- Always include proper labels for form inputs
- Use semantic HTML elements
- Provide aria-labels for icon-only buttons
- Ensure keyboard navigability

### 3. Performance
- Use CSS animations over JavaScript
- Only animate transform and opacity
- Add will-change sparingly
- Remove animations for reduced-motion preference

### 4. Responsiveness
- Design mobile-first
- Use relative units (rem, em, %)
- Test on multiple screen sizes
- Ensure touch targets are min 44x44px

### 5. Dark Mode
- Always provide dark mode variants
- Test contrast ratios in both modes
- Use semantic color tokens

---

## Component Library Roadmap

### Phase 1 (Current) ✅ COMPLETED
- ✅ Buttons (primary, secondary, icon)
- ✅ Cards (content, feature)
- ✅ Badges & status indicators (verified, disputed, pending, AI)
- ✅ Form inputs (text, select, textarea)
- ✅ Loading states (skeleton, spinner)
- ✅ Alerts (error, success, info)
- ✅ Navigation (mobile bottom bar with SVG icons, sticky header)
- ✅ Modal dialogs (with focus trap and keyboard handling)
- ✅ Toast notifications (success, error, info with animations)
- ✅ Tooltips (with position control)
- ✅ Empty states (with illustrations and actions)
- ✅ Icon system (30+ SVG icons)

### Phase 2 (In Progress)
- [ ] Dropdown menus
- [ ] Tabs
- [ ] Pagination
- [ ] Progress indicators
- [ ] Avatar components
- [ ] Breadcrumbs

### Phase 3 (Future)
- [ ] Data tables
- [ ] Charts and graphs
- [ ] File upload
- [ ] Rich text editor
- [ ] Date picker
- [ ] Search autocomplete
- [ ] Infinite scroll
- [ ] Virtual lists

---

## New Component Documentation

### Icon System

**Location**: `src/components/icons/index.tsx`

**Usage:**
```tsx
import { HomeIcon, SearchIcon, CheckCircleIcon } from '@/components/icons';

// Basic usage
<HomeIcon size={24} className="text-blue-600" />

// With custom styling
<CheckCircleIcon size={32} className="text-green-500" />
```

**Available Icons:**
- **Navigation**: HomeIcon, SearchIcon, PlusIcon, UserIcon, SettingsIcon
- **Actions**: ThumbsUpIcon, ThumbsDownIcon, MessageIcon, ShareIcon, BookmarkIcon, FlagIcon
- **Status**: CheckCircleIcon, AlertCircleIcon, ClockIcon, SparklesIcon
- **Content**: FileTextIcon, ImageIcon, VideoIcon, LinkIcon
- **UI**: XIcon, ChevronDownIcon, MenuIcon, BellIcon, HeartIcon, TrendingUpIcon, ArrowRightIcon, LoaderIcon, InfoIcon

### Toast Notifications

**Location**: `src/components/ui/Toast.tsx`

**Usage:**
```tsx
import { useToast, ToastContainer } from '@/components/ui/Toast';

function MyComponent() {
  const { toasts, showSuccess, showError, showInfo, removeToast } = useToast();
  
  const handleSuccess = () => {
    showSuccess('Operation completed successfully!');
  };
  
  return (
    <>
      <button onClick={handleSuccess}>Show Toast</button>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
```

**Features:**
- Auto-dismiss after duration (default 5s)
- Success, error, and info variants
- Slide-in animations
- Close button
- Stacks multiple toasts

### Modal Dialog

**Location**: `src/components/ui/Modal.tsx`

**Usage:**
```tsx
import { Modal } from '@/components/ui/Modal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modal Title"
        size="md"
      >
        <p>Modal content goes here</p>
      </Modal>
    </>
  );
}
```

**Features:**
- Backdrop blur effect
- Focus trap
- Keyboard navigation (Escape to close)
- Multiple sizes (sm, md, lg, xl)
- Scroll prevention
- Animations

### Tooltip

**Location**: `src/components/ui/Tooltip.tsx`

**Usage:**
```tsx
import { Tooltip } from '@/components/ui/Tooltip';

<Tooltip content="This is a helpful tip" position="top" delay={300}>
  <button>Hover me</button>
</Tooltip>
```

**Props:**
- `content`: Tooltip text
- `position`: 'top' | 'bottom' | 'left' | 'right'
- `delay`: Milliseconds before showing (default 300)

### Badge Component

**Location**: `src/components/ui/Badge.tsx`

**Usage:**
```tsx
import { Badge, StatusBadge } from '@/components/ui/Badge';

// Basic usage
<Badge variant="verified" size="md">Verified</Badge>

// Status badge (auto-maps status to variant)
<StatusBadge status="Verified" />
```

**Variants:**
- `verified`: Green checkmark
- `disputed`: Red alert
- `pending`: Yellow clock
- `ai`: Purple sparkles

### Empty State

**Location**: `src/components/ui/EmptyState.tsx`

**Usage:**
```tsx
import { EmptyState } from '@/components/ui/EmptyState';

<EmptyState
  icon="search"
  title="No Results Found"
  description="Try adjusting your search terms"
  action={
    <button className="btn-primary">Clear Filters</button>
  }
/>
```

**Icons:** 'search', 'content', 'verified', or custom ReactNode

---

## Resources

- **Design System**: [DESIGN.md](./DESIGN.md)
- **Accessibility Guide**: [ACCESSIBILITY.md](./ACCESSIBILITY.md)
- **Theme Tokens**: [theme.js](./frontend_app/src/styles/theme.js)
- **Global Styles**: [globals.css](./frontend_app/src/app/globals.css)

---

**Last Updated**: January 2025  
**Maintained by**: VeridiaApp Design Team

For questions or contributions, please open an issue or submit a PR.
