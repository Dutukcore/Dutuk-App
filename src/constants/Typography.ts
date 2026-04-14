// Typography constants based on the design system
export const Typography = {
  Header1: {
    fontSize: 32,
    fontWeight: '500' as const,
    lineHeight: 39,
  },
  Header2: {
    fontSize: 30,
    fontWeight: '500' as const,
    lineHeight: 36,
  },
  H1: {
    fontSize: 28,
    fontWeight: '500' as const,
    lineHeight: 34,
  },
  H2: {
    fontSize: 26,
    fontWeight: '500' as const,
    lineHeight: 32,
  },
  H3: {
    fontSize: 24,
    fontWeight: '500' as const,
    lineHeight: 29,
  },
  H4: {
    fontSize: 22,
    fontWeight: '500' as const,
    lineHeight: 27,
  },
  H5: {
    fontSize: 20,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  P1: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  P2: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 19,
  },
  P3: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 17,
  },
  P4: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 15,
  },
  P5: {
    fontSize: 10,
    fontWeight: '400' as const,
    lineHeight: 12,
  },
} as const;

export const Colors = {
  // Primary Colors
  primaryMaroon: '#800000',
  white: '#FFFFFF',
  background: '#fffcfa',
  cardBackground: '#ffffff',
  
  // Text Colors
  textHeading: '#1c1917',
  textBody: '#57534e',
  textMuted: '#a8a29e',
  textSecondary: '#292524',
  
  // UI Elements
  border: '#e7e5e4',
  divider: '#e7e5e4',
  buttonSecondaryBg: 'rgba(255,255,255,0.5)',
  
  // Legacy (for gradual migration)
  black: '#1c1917',
  lightGray: '#fffcfa',
  textLight: '#FAFAFA',
} as const;