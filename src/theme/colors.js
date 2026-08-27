// Material You-inspired token system (static palette — no dynamic color extraction)
// ponytail: static tokens only; upgrade to react-native-material-you if dynamic color is needed

export const accentColors = {
  blue: '#6D5EF5',
  purple: '#AF52DE',
  pink: '#FF2D92',
  red: '#FF453A',
  orange: '#FF9500',
  yellow: '#FFD60A',
  green: '#30D158',
  teal: '#5AC8FA',
  indigo: '#5856D6',
  mint: '#00C7BE',
};

export const baseColors = {
  dark: {
    // MD3 surface roles
    background: '#0F0F13',
    surface: '#1A1A22',
    surfaceSecondary: '#22222C',
    surfaceElevated: '#2C2C38',
    surfaceVariant: '#2A2A36',

    textPrimary: '#E6E1E8',
    textSecondary: '#CAC4D0',
    textTertiary: '#79747E',

    border: '#38383F',
    separator: '#38383F',

    success: '#30D158',
    warning: '#FFD60A',
    error: '#CF6679',

    destructive: '#CF6679',
    overlay: 'rgba(0, 0, 0, 0.6)',
    shadow: 'rgba(0, 0, 0, 0.4)',

    // MD3 elevation overlays (expressed as alpha-blended surface tints)
    elevation0: '#0F0F13',
    elevation1: '#1A1A22',
    elevation2: '#202028',
    elevation3: '#26262F',
  },

  light: {
    background: '#FFFBFE',
    surface: '#FFFFFF',
    surfaceSecondary: '#F4EFF4',
    surfaceElevated: '#FFFBFE',
    surfaceVariant: '#E7E0EC',

    textPrimary: '#1C1B1F',
    textSecondary: '#49454F',
    textTertiary: '#79747E',

    border: '#CAC4D0',
    separator: '#E7E0EC',

    success: '#34C759',
    warning: '#FF9500',
    error: '#B3261E',

    destructive: '#B3261E',
    overlay: 'rgba(0, 0, 0, 0.3)',
    shadow: 'rgba(0, 0, 0, 0.12)',

    elevation0: '#FFFBFE',
    elevation1: '#FFFFFF',
    elevation2: '#F8F3FD',
    elevation3: '#F3EDF7',
  },
};

export const createTheme = (accentColor = accentColors.blue, mode = 'dark') => {
  const colorScheme = baseColors[mode] || baseColors.dark;
  const accent = typeof accentColor === 'string' && accentColor.startsWith('#')
    ? accentColor
    : accentColors.blue;

  return {
    colors: {
      ...colorScheme,
      accent,
      accentLight: accent + '20',
      accentMedium: accent + '40',
      accentDark: accent + 'CC',
      // MD3 role aliases for consumers
      primary: accent,
      onPrimary: '#FFFFFF',
      primaryContainer: accent + '30',
      onPrimaryContainer: accent,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    typography: {
      displayLarge: { fontSize: 57, fontWeight: '400', lineHeight: 64 },
      displayMedium: { fontSize: 45, fontWeight: '400', lineHeight: 52 },
      headlineLarge: { fontSize: 32, fontWeight: '400', lineHeight: 40 },
      headlineMedium: { fontSize: 28, fontWeight: '400', lineHeight: 36 },
      headlineSmall: { fontSize: 24, fontWeight: '400', lineHeight: 32 },
      titleLarge: { fontSize: 22, fontWeight: '400', lineHeight: 28 },
      titleMedium: { fontSize: 16, fontWeight: '500', lineHeight: 24 },
      titleSmall: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
      bodyLarge: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
      bodyMedium: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
      bodySmall: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
      labelLarge: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
      labelMedium: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
      labelSmall: { fontSize: 11, fontWeight: '500', lineHeight: 16 },
      // Legacy aliases kept for backward compat
      largeTitle: { fontSize: 34, fontWeight: '700', lineHeight: 41 },
      title1: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
      title2: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
      title3: { fontSize: 20, fontWeight: '600', lineHeight: 25 },
      headline: { fontSize: 17, fontWeight: '600', lineHeight: 22 },
      body: { fontSize: 17, fontWeight: '400', lineHeight: 22 },
      callout: { fontSize: 16, fontWeight: '400', lineHeight: 21 },
      subhead: { fontSize: 15, fontWeight: '400', lineHeight: 20 },
      footnote: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
      caption1: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
      caption2: { fontSize: 11, fontWeight: '400', lineHeight: 13 },
    },
    borderRadius: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      xxl: 28,
      round: 999,
    },
    shadows: {
      small: {
        shadowColor: colorScheme.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 3,
        elevation: 1,
      },
      medium: {
        shadowColor: colorScheme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 3,
      },
      large: {
        shadowColor: colorScheme.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 6,
      },
    },
  };
};
