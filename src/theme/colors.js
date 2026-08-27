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
  // Dark theme colors
  dark: {
    background: '#15151B',
    surface: '#202027',
    surfaceSecondary: '#292933',
    surfaceElevated: '#33333F',
    
    // Text colors
    textPrimary: '#FFFFFF',
    textSecondary: '#B4B2C2',
    textTertiary: '#797787',
    
    // Border and separator colors
    border: '#393944',
    separator: '#393944',
    
    // Status colors
    success: '#30D158',
    warning: '#FFD60A',
    error: '#FF453A',
    
    // Special colors
    destructive: '#FF453A',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
  
  // Light theme colors
  light: {
    background: '#F7F6F2',
    surface: '#FFFFFF',
    surfaceSecondary: '#F0EFF6',
    surfaceElevated: '#FFFFFF',
    
    // Text colors
    textPrimary: '#1B1A22',
    textSecondary: '#676572',
    textTertiary: '#8E8B98',
    
    // Border and separator colors
    border: '#DEDBE5',
    separator: '#DEDBE5',
    
    // Status colors
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    
    // Special colors
    destructive: '#FF3B30',
    overlay: 'rgba(0, 0, 0, 0.3)',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
};

export const createTheme = (accentColor = accentColors.blue, mode = 'dark') => {
  const colorScheme = baseColors[mode] || baseColors.dark;
  
  // Ensure accentColor is a valid string
  const validAccentColor = typeof accentColor === 'string' && accentColor.startsWith('#') 
    ? accentColor 
    : accentColors.blue;
  
  return {
    colors: {
      ...colorScheme,
      accent: validAccentColor,
      accentLight: validAccentColor + '20', // 20% opacity
      accentDark: validAccentColor + 'CC', // 80% opacity
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
      largeTitle: {
        fontSize: 34,
        fontWeight: '700',
        lineHeight: 41,
      },
      title1: {
        fontSize: 28,
        fontWeight: '700',
        lineHeight: 34,
      },
      title2: {
        fontSize: 22,
        fontWeight: '700',
        lineHeight: 28,
      },
      title3: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 25,
      },
      headline: {
        fontSize: 17,
        fontWeight: '600',
        lineHeight: 22,
      },
      body: {
        fontSize: 17,
        fontWeight: '400',
        lineHeight: 22,
      },
      callout: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 21,
      },
      subhead: {
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 20,
      },
      footnote: {
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 18,
      },
      caption1: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
      },
      caption2: {
        fontSize: 11,
        fontWeight: '400',
        lineHeight: 13,
      },
    },
    borderRadius: {
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      round: 999,
    },
    shadows: {
      small: {
        shadowColor: colorScheme.shadow,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      medium: {
        shadowColor: colorScheme.shadow,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      },
      large: {
        shadowColor: colorScheme.shadow,
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
      },
    },
  };
};