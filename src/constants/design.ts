/**
 * handdrawn-mono-ui tokens.
 * Source of truth: design/lapora.figcraft, page "01 · Design System".
 * Rule: one accent per screen, accent never carries meaning alone,
 * wobble belongs to card lines only (never text, never icons).
 */

export const palette = {
  light: {
    paper: '#FFFFFF',
    paper2: '#F4F4F5',
    paper3: '#E9E9EB',
    ink: '#111111',
    ink2: '#4A4A4E',
    ink3: '#9A9AA0',
    accent: '#E5322D',
    grid: '#DFDFE1',
    road: '#D2D2D6',
    shade: '#E9E9EB',
  },
  dark: {
    paper: '#141414',
    paper2: '#1E1E1F',
    paper3: '#2A2A2C',
    ink: '#F2F2F2',
    ink2: '#B4B4B9',
    ink3: '#7C7C82',
    accent: '#FF5A52',
    grid: '#2B2B2D',
    road: '#3A3A3D',
    shade: '#2A2A2C',
  },
} as const;

export type ColorSchemeName = keyof typeof palette;
export type Colors = (typeof palette)['light'];

export const radius = {
  card: 22,
  tile: 16,
  button: 16,
  input: 14,
  sheet: 28,
  pill: 999,
} as const;

export const border = {
  heavy: 2.5,
  icon: 2,
  hair: 1,
  dashed: 1.6,
} as const;

export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 64,
} as const;

export const font = {
  display: 'PlusJakartaSans_800ExtraBold',
  displayBold: 'PlusJakartaSans_700Bold',
  displaySemi: 'PlusJakartaSans_600SemiBold',
  displayMedium: 'PlusJakartaSans_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  hand: 'Caveat_400Regular',
  handBold: 'Caveat_700Bold',
} as const;

export const type = {
  display: { fontFamily: font.display, fontSize: 40, lineHeight: 44, letterSpacing: -1 },
  h1: { fontFamily: font.display, fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  h2: { fontFamily: font.displayBold, fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  h3: { fontFamily: font.displayBold, fontSize: 17, lineHeight: 23, letterSpacing: -0.2 },
  body: { fontFamily: font.body, fontSize: 14, lineHeight: 21 },
  bodySmall: { fontFamily: font.body, fontSize: 12.5, lineHeight: 18 },
  meta: { fontFamily: font.bodyMedium, fontSize: 11, lineHeight: 15, letterSpacing: 0.6 },
  label: { fontFamily: font.displaySemi, fontSize: 10.5, lineHeight: 14, letterSpacing: 1.3 },
  button: { fontFamily: font.displayBold, fontSize: 15, lineHeight: 20 },
  buttonSmall: { fontFamily: font.displaySemi, fontSize: 13, lineHeight: 18 },
  hand: { fontFamily: font.hand, fontSize: 17, lineHeight: 22 },
  number: { fontFamily: font.display, fontSize: 28, lineHeight: 32, letterSpacing: -0.5 },
} as const;

export const motion = {
  pressScale: 0.97,
  pressMs: 120,
  sheetSpring: { damping: 18, stiffness: 180, mass: 1 },
  settleMs: 400,
  crossfadeMs: 180,
  toastMs: 220,
  reducedFadeMs: 120,
} as const;

export const layout = {
  screenWidth: 360,
  margin: 16,
  contentWidth: 328,
  touch: 44,
  navHeight: 76,
  buttonHeight: 54,
  buttonSmallHeight: 44,
} as const;
