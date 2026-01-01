/**
 * Blindish Design System - Colors
 * Based on the marketing site brand colors
 */

export const Colors = {
  // Brand Colors
  coral: '#FF6B6B',
  peach: '#FFB4A2',
  pink: '#FF8BA7',
  light: '#F5F5F5',
  dark: '#3D1A1A',

  // Gradients
  gradient: {
    from: '#FF8BA7',
    to: '#FFAA8B',
    darkFrom: '#C25A70',
    darkTo: '#B06A50',
  },

  // Semantic Colors (Light Mode)
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    border: '#E5E5E5',
    text: {
      primary: '#1A1A1A',
      secondary: '#6B6B6B',
      tertiary: '#9B9B9B',
      inverse: '#FFFFFF',
    },
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
  },

  // Dark Mode Colors
  dark: {
    background: '#1A1A1A',
    surface: '#2A2A2A',
    border: '#3A3A3A',
    text: {
      primary: '#FFFFFF',
      secondary: '#B5B5B5',
      tertiary: '#8B8B8B',
      inverse: '#1A1A1A',
    },
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    info: '#60A5FA',
  },

  // Interactive States
  interactive: {
    primary: '#FF6B6B',
    primaryHover: '#FF5252',
    primaryActive: '#FF3939',
    primaryFaded: 'rgba(255, 107, 107, 0.3)', // For loading states
    secondary: '#FFB4A2',
    secondaryHover: '#FFA089',
    secondaryActive: '#FF8C70',
    secondaryFaded: 'rgba(255, 180, 162, 0.3)', // For loading states
  },

  // Mesh Gradient Overlay (for blurred photos)
  meshGradient: {
    coral: [
      '#FF6B6B',  // Coral base
      '#D9B870',  // Medium gold (NEW - contrast)
      '#FFB4A2',  // Peach harmony
      '#C8A865',  // Deep gold (NEW - contrast)
      '#FF8BA7',  // Pink harmony
      '#F5E8C8',  // Light gold (NEW - contrast)
    ],
    opacity: 0.7,
  },

  // Blur Overlay (for progressive unblurring)
  blur: {
    overlay: 'rgba(255, 107, 107, 0.3)', // Coral with transparency
  },

  // Fairy Tale Decorative Colors
  fairytale: {
    // Card backgrounds - theme-aware
    cardBackground: {
      light: '#FFF5F0',  // Soft peachy cream
      dark: '#2A1F1F',   // Deep warm brown
    },
    // Card gradients - theme-aware
    gradients: {
      light: ['#FFF5F0', '#FFE8E0', '#FFD4C8'], // Peachy warm gradient
      dark: ['#2A1F1F', '#3D2626', '#4A2F2F'],  // Deep brown gradient
    },
    // Content container backgrounds - theme-aware
    contentBg: {
      light: 'rgba(255, 255, 255, 0.95)',
      dark: 'rgba(42, 31, 31, 0.95)',
    },
    // Surface backgrounds - theme-aware
    surface: {
      light: '#FFFFFF',
      dark: '#3A2F2F', // Slightly lighter than cardBackground for contrast
    },
    // Card content backgrounds - theme-aware
    cardContent: {
      light: 'rgba(255, 255, 255, 0.95)',
      dark: 'rgba(42, 31, 31, 0.95)',
    },
    // Component backgrounds (score circles, badges) - theme-aware
    componentBg: {
      light: '#FFFFFF',
      dark: '#3A2F2F',
    },
    gold: {
      deep: '#C8A865',           // Deep antique gold
      medium: '#D9B870',         // Medium gold
      light: '#F5E8C8',          // Light champagne gold
    },
    ivy: {
      stem: '#4A7C59',           // Forest green
      leaf: '#5C9973',           // Medium green
      highlight: '#8BC89F',      // Light green highlight
    },
    particles: {
      butterflyPink: '#FFE4E1',  // Misty rose
      butterflyLavender: '#E6E6FA', // Lavender
      butterflyYellow: '#FFF9E3',   // Cream
      fireflyGold: '#FFD700',       // Gold
      sparkleWhite: '#FFFFFF',      // Pure white
    },
  },
} as const;

export type ColorScheme = 'light' | 'dark';
