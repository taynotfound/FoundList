export const accentColors = {
  blue: '#007AFF',
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
    background: '#000000',
    surface: '#1C1C1E',
    surfaceSecondary: '#2C2C2E',
    surfaceElevated: '#3A3A3C',
    
    // Text colors
    textPrimary: '#FFFFFF',
    textSecondary: '#8E8E93',
    textTertiary: '#636366',
    
    // Border and separator colors
    border: '#38383A',
    separator: '#38383A',
    
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
    background: '#FFFFFF',
    surface: '#F2F2F7',
    surfaceSecondary: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    
    // Text colors
    textPrimary: '#000000',
    textSecondary: '#6D6D70',
    textTertiary: '#8E8E93',
    
    // Border and separator colors
    border: '#C6C6C8',
    separator: '#C6C6C8',
    
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