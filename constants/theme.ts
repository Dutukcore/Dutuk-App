/**
 * Dutuk Brand Theme — Shared Design Tokens
 * Use these across all vendor app screens for consistency
 */

export const COLORS = {
  // Brand Palette
  primary: '#4F0000',        // Deep maroon — primary brand
  primaryMid: '#7C2A2A',     // Mid maroon — hover states, accents
  primaryLight: '#A0522D',   // Light maroon — icons, borders
  primaryAlpha: (opacity: number) => `rgba(79, 0, 0, ${opacity})`,

  // Gold Accent
  gold: '#FFC13C',
  goldLight: '#FDF5E6',

  // Semantic
  success: '#34C759',
  successBg: 'rgba(52, 199, 89, 0.1)',
  error: '#FF3B30',
  errorBg: 'rgba(255, 59, 48, 0.1)',
  warning: '#FF9500',
  warningBg: 'rgba(255, 149, 0, 0.1)',
  info: '#007AFF',
  infoBg: 'rgba(0, 122, 255, 0.1)',

  // Neutrals
  bgBase: '#FAF8F5',          // App background
  bgCard: '#FFFFFF',
  bgCardAlt: 'rgba(255, 255, 255, 0.98)',
  bgMuted: 'rgba(79, 0, 0, 0.04)',

  // Text
  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  textMuted: '#A8A29E',
  textBrand: '#4F0000',
  textWhite: '#FFFFFF',

  // Borders
  border: 'rgba(79, 0, 0, 0.08)',
  borderLight: 'rgba(79, 0, 0, 0.04)',
  borderMedium: 'rgba(79, 0, 0, 0.12)',
} as const;

export const TYPOGRAPHY = {
  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 32,
  '4xl': 36,

  // Font weights (RN uses string values)
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
  '6xl': 48,
  '7xl': 56,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  full: 9999,
} as const;

export const SHADOW = {
  sm: {
    shadowColor: '#4F0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#4F0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#4F0000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#4F0000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

// Status badge configurations — used across Order cards
export const ORDER_STATUS_CONFIG = {
  pending: {
    bg: 'rgba(79, 0, 0, 0.08)',
    text: '#4F0000',
    label: 'PENDING',
    icon: 'time-outline',
  },
  approved: {
    bg: 'rgba(52, 199, 89, 0.12)',
    text: '#1E8B3E',
    label: 'APPROVED',
    icon: 'checkmark-circle-outline',
  },
  completed: {
    bg: '#1C1917',
    text: '#FFFFFF',
    label: 'COMPLETED',
    icon: 'trophy-outline',
  },
  rejected: {
    bg: 'rgba(255, 59, 48, 0.1)',
    text: '#C0392B',
    label: 'REJECTED',
    icon: 'close-circle-outline',
  },
} as const;
