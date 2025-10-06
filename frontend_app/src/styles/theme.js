/**
 * VeridiaApp Design System
 * Complete design tokens for consistent styling across the application
 * Based on DESIGN.md specifications
 */

export const theme = {
  // Color Palette
  colors: {
    // Primary Colors (Trust & Clarity)
    primary: {
      main: '#0A7FFF',      // Main brand color
      light: '#4DA6FF',     // Hover states
      dark: '#0862CC',      // Pressed states
    },
    secondary: {
      main: '#00B5B8',      // Teal accent
      light: '#33D4D7',     // Light teal
      dark: '#008C8E',      // Dark teal
    },
    
    // Verification Status Colors
    success: {
      main: '#10B981',      // Verified content
      light: '#34D399',     // Success states
      dark: '#059669',      // Verified badges
    },
    warning: {
      main: '#F59E0B',      // Under review
      light: '#FBBF24',     // Warning light
      dark: '#D97706',      // Warning dark
    },
    error: {
      main: '#EF4444',      // Disputed/errors
      light: '#F87171',     // Error light
      dark: '#DC2626',      // Error dark
    },
    
    // Neutral Colors
    gray: {
      50: '#F9FAFB',        // Subtle backgrounds
      100: '#F3F4F6',       // Card backgrounds
      200: '#E5E7EB',       // Borders, dividers
      300: '#D1D5DB',       // Disabled states
      500: '#6B7280',       // Secondary text
      700: '#374151',       // Body text
      900: '#111827',       // Headings, primary text
    },
    
    // Background & Text (Light Mode)
    background: '#ffffff',
    foreground: '#171717',
    
    // Dark Mode
    dark: {
      background: '#0A0A0A', // Pure black with warmth
      surface: '#1A1A1A',    // Card backgrounds
      text: {
        primary: '#EDEDED',   // High contrast
        secondary: '#A3A3A3', // Secondary text
      },
    },
  },
  
  // Typography
  typography: {
    // Font Families
    fontFamily: {
      body: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      heading: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'Courier New', Consolas, Monaco, monospace",
    },
    
    // Font Sizes (Mobile / Desktop)
    fontSize: {
      display: { mobile: '32px', desktop: '48px' },
      h1: { mobile: '28px', desktop: '40px' },
      h2: { mobile: '24px', desktop: '32px' },
      h3: { mobile: '20px', desktop: '24px' },
      h4: { mobile: '18px', desktop: '20px' },
      body: '16px',
      small: '14px',
      caption: '12px',
    },
    
    // Font Weights
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    
    // Line Heights
    lineHeight: {
      tight: 1.2,
      snug: 1.25,
      normal: 1.6,
      relaxed: 1.8,
    },
    
    // Letter Spacing
    letterSpacing: {
      tight: '-0.01em',
      normal: '0',
      wide: '0.025em',
    },
  },
  
  // Spacing System (8px base unit)
  spacing: {
    1: '4px',      // Tight spacing
    2: '8px',      // Base unit
    3: '12px',     // Small sections
    4: '16px',     // Standard rhythm
    6: '24px',     // Section spacing
    8: '32px',     // Major sections
    12: '48px',    // Page sections
    16: '64px',    // Hero spacing
  },
  
  // Border Radius
  borderRadius: {
    sm: '4px',     // Small elements
    md: '8px',     // Cards, buttons
    lg: '12px',    // Large cards
    xl: '16px',    // Modals, drawers
    full: '9999px', // Pills, avatars
  },
  
  // Shadows (Elevation)
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
    hover: '0 20px 40px rgba(10, 127, 255, 0.15)', // Primary color shadow
  },
  
  // Animation Durations
  animation: {
    duration: {
      instant: '100ms',   // Micro feedback
      fast: '200ms',      // UI interactions
      base: '300ms',      // Standard animations
      moderate: '400ms',  // Complex transitions
      slow: '500ms',      // Page transitions
    },
    
    // Easing Curves
    easing: {
      easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      snappy: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  
  // Breakpoints (Mobile-First)
  breakpoints: {
    mobile: '320px',
    tablet: '640px',
    desktop: '1024px',
    wide: '1440px',
  },
  
  // Z-Index Scale
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1200,
    modal: 1300,
    toast: 1400,
  },
};
