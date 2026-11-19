/**
 * LIFEOS Design Tokens
 * Dark mode is default; Light mode is alternative.
 */

export interface ColorTokens {
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundElevated: string;
  accentPrimary: string;
  accentHover: string;
  accentMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  error: string;
  errorMuted: string;
  overlay: string;
}

export const darkColors: ColorTokens = {
  backgroundPrimary: '#242321',
  backgroundSecondary: '#302E2A',
  backgroundElevated: '#3A3833',
  accentPrimary: '#F28C28',
  accentHover: '#E07B18',
  accentMuted: 'rgba(242, 140, 40, 0.15)',
  textPrimary: '#F4F1EB',
  textSecondary: '#A8A39A',
  textMuted: '#7D776E',
  border: '#45413B',
  borderLight: '#57524A',
  success: '#62B68A',
  successMuted: 'rgba(98, 182, 138, 0.15)',
  warning: '#E6AD54',
  warningMuted: 'rgba(230, 173, 84, 0.15)',
  error: '#D86B63',
  errorMuted: 'rgba(216, 107, 99, 0.15)',
  overlay: 'rgba(20, 19, 18, 0.75)',
};

export const lightColors: ColorTokens = {
  backgroundPrimary: '#F7F6F2',
  backgroundSecondary: '#EFECE6',
  backgroundElevated: '#FFFFFF',
  accentPrimary: '#D47318',
  accentHover: '#B86010',
  accentMuted: 'rgba(212, 115, 24, 0.12)',
  textPrimary: '#242321',
  textSecondary: '#66625B',
  textMuted: '#969085',
  border: '#DDD8CE',
  borderLight: '#ECE7DD',
  success: '#2E8555',
  successMuted: 'rgba(46, 133, 85, 0.12)',
  warning: '#B37D22',
  warningMuted: 'rgba(179, 125, 34, 0.12)',
  error: '#BA3E35',
  errorMuted: 'rgba(186, 62, 53, 0.12)',
  overlay: 'rgba(36, 35, 33, 0.4)',
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const radii = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

export const typography = {
  fontSize: {
    tiny: 11,
    small: 13,
    body: 15,
    subhead: 16,
    title3: 18,
    title2: 21,
    title1: 26,
    display: 32,
  },
  lineHeight: {
    tiny: 14,
    small: 17,
    body: 21,
    subhead: 23,
    title3: 25,
    title2: 28,
    title1: 34,
    display: 40,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 8,
  },
};
