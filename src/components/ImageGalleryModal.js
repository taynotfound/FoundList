import React, { useState, useRef } from 'react';
import {
  View,
  Modal,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StyleSheet,
  Text,
  StatusBar,
  PanResponder,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ImageGalleryModal = ({ visible, images, initialIndex = 0, onClose }) => {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef(null);
  
  // Zoom and pan functionality
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [isZoomed, setIsZoomed] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (evt, gestureState) => {
        if (isZoomed) {
          translateX.setValue(gestureState.dx);
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (isZoomed) {
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          // Double tap to zoom
          if (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
            handleZoom();
          }
        }
      },
    })
  ).current;

  const handleZoom = () => {
    const newScale = isZoomed ? 1 : 2;
    
    Animated.parallel([
      Animated.spring(scale, {
        toValue: newScale,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
    
    setIsZoomed(!isZoomed);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
    }
  };

  const renderImage = ({ item, index }) => (
    <View style={styles.imageContainer}>
      <Animated.View
        style={[
          styles.imageWrapper,
          {
            transform: [
              { scale },
              { translateX },
              { translateY },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Image
          source={{ uri: item }}
          style={styles.fullImage}
          resizeMode="contain"
          onError={(error) => {
            console.log('Gallery image load error:', error.nativeEvent.error, 'URI:', item?.substring(0, 50) + '...');
          }}
          onLoad={() => {
            console.log('Gallery image loaded successfully:', item?.substring(0, 50) + '...');
          }}
        />
      </Animated.View>
    </View>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const handleClose = () => {
    // Reset zoom state
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
    setIsZoomed(false);
    onClose();
  };

  if (!visible || !images || images.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
      transparent={true}
    >
      <StatusBar hidden />
      <View style={[styles.container, { backgroundColor: theme.colors.background + 'F0' }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface + 'E6' }]}>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
            onPress={handleClose}
          >
            <Icon name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          
          <Text style={[styles.counterText, { color: theme.colors.textPrimary }]}>
            {currentIndex + 1} of {images.length}
          </Text>
          
          <TouchableOpacity
            style={[styles.zoomButton, { backgroundColor: theme.colors.surface }]}
            onPress={handleZoom}
          >
            <Icon 
              name={isZoomed ? "zoom-out" : "zoom-in"} 
              size={24} 
              color={theme.colors.textPrimary} 
            />
          </TouchableOpacity>
        </View>

        {/* Image Gallery */}
        <FlatList
          ref={flatListRef}
          data={images}
          renderItem={renderImage}
          keyExtractor={(item, index) => `image-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 50,
          }}
          getItemLayout={(data, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.prevButton, { backgroundColor: theme.colors.surface + 'CC' }]}
                onPress={goToPrevious}
              >
                <Icon name="chevron-left" size={32} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            )}
            
            {currentIndex < images.length - 1 && (
              <TouchableOpacity
                style={[styles.navButton, styles.nextButton, { backgroundColor: theme.colors.surface + 'CC' }]}
                onPress={goToNext}
              >
                <Icon name="chevron-right" size={32} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Image Dots Indicator */}
        {images.length > 1 && (
          <View style={styles.dotsContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === currentIndex 
                      ? theme.colors.accent 
                      : theme.colors.textSecondary + '50',
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50, // Account for status bar
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 16,
    fontWeight: '600',
  },
  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: screenWidth,
    height: screenHeight - 140, // Account for header and dots
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: screenWidth,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: screenWidth - 40,
    height: '100%',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevButton: {
    left: 20,
  },
  nextButton: {
    right: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default ImageGalleryModal;