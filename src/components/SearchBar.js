import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const SearchBar = ({ onSearch, onFocus, onBlur, placeholder = "Search todos..." }) => {
  const { theme } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  
  // Animation values
  const searchBarAnim = useRef(new Animated.Value(0)).current;
  const iconAnim = useRef(new Animated.Value(0)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate search bar expansion/contraction
    Animated.parallel([
      Animated.spring(searchBarAnim, {
        toValue: isFocused ? 1 : 0,
        useNativeDriver: false,
        tension: 80,
        friction: 8,
      }),
      Animated.timing(iconAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(backgroundAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    if (!searchText) {
      setIsFocused(false);
    }
    onBlur?.();
  };

  const handleClear = () => {
    setSearchText('');
    onSearch?.('');
    inputRef.current?.blur();
    setIsFocused(false);
  };

  const handleTextChange = (text) => {
    setSearchText(text);
    onSearch?.(text);
  };

  const animatedWidth = searchBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['100%', '100%'], // Use percentage instead of fixed width
  });

  const animatedPadding = searchBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 20],
  });

  const animatedBackgroundColor = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      theme.colors.surface || '#F2F2F7', 
      theme.colors.surfaceElevated || theme.colors.surface || '#FFFFFF'
    ],
  });

  const animatedBorderColor = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      theme.colors.border || '#C6C6C8', 
      theme.colors.accent || '#007AFF'
    ],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.searchContainer,
          {
            width: animatedWidth,
            paddingHorizontal: animatedPadding,
            backgroundColor: animatedBackgroundColor,
            borderColor: animatedBorderColor,
          },
        ]}
      >
        <Icon 
          name="search" 
          size={20} 
          color={isFocused ? theme.colors.accent : theme.colors.textSecondary}
          style={styles.searchIcon}
        />
        
        <TextInput
          ref={inputRef}
          style={[
            styles.searchInput,
            { 
              color: theme.colors.textPrimary,
            },
          ]}
          value={searchText}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />

        {searchText.length > 0 && (
          <Animated.View
            style={[
              styles.clearButtonContainer,
              {
                opacity: iconAnim,
                transform: [
                  {
                    scale: iconAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.clearButton,
                { backgroundColor: theme.colors.textSecondary + '20' },
              ]}
              onPress={handleClear}
            >
              <Icon 
                name="close" 
                size={14} 
                color={theme.colors.textSecondary} 
              />
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>

      {isFocused && searchText.length === 0 && (
        <Animated.View
          style={[
            styles.searchHint,
            {
              opacity: iconAnim,
              transform: [
                {
                  translateY: iconAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Could add search suggestions or recent searches here */}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    borderWidth: 2,
    width: '100%', // Ensure it respects container width
    maxWidth: '100%', // Prevent overflow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    fontWeight: '400',
  },
  clearButtonContainer: {
    marginLeft: 8,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchHint: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
});

export default SearchBar;