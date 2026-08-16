/**
 * Programmatic access to DashDish design system tokens.
 * Matches UX_SPEC.md §PART A — DESIGN SYSTEM.
 */
export const DESIGN_TOKENS = {
  colors: {
    bg: '#FAFAF8',
    surface: '#FFFFFF',
    textPrimary: '#14151A',
    textSecondary: '#5C5F6B',
    textTertiary: '#9698A3',
    border: '#E8E8E4',
    accent: '#E4572E',
    accentPressed: '#C8471F',
    honesty: '#1B8A5A',
    success: '#1B8A5A',
    warning: '#C88A1B',
    error: '#D23C3C',
    overlay: 'rgba(20, 21, 26, 0.5)',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    display: { fontSize: '32px', lineHeight: '40px', fontWeight: 600 },
    h1: { fontSize: '24px', lineHeight: '32px', fontWeight: 600 },
    h2: { fontSize: '20px', lineHeight: '28px', fontWeight: 600 },
    bodyLg: { fontSize: '16px', lineHeight: '24px', fontWeight: 400 },
    body: { fontSize: '14px', lineHeight: '20px', fontWeight: 400 },
    caption: { fontSize: '12px', lineHeight: '16px', fontWeight: 400 },
  },
  spacing: {
    space1: '4px',
    space2: '8px',
    space3: '12px',
    space4: '16px',
    space5: '24px',
    space6: '32px',
    space7: '48px',
    space8: '64px',
  },
  radius: {
    btn: '12px',
    card: '16px',
  },
} as const;
