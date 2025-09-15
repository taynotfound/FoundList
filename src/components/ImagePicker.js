import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const TodoImagePicker = ({ images = [], onImagesChange, maxImages = 5 }) => {
  const { theme } = useTheme();
  const [showOptions, setShowOptions] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and photo library permissions to add images to your todos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const convertToBase64 = async (uri) => {
    try {
      // Use ImageManipulator to get base64, which works across platforms
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [], // No manipulations, just convert to base64
        {
          format: ImageManipulator.SaveFormat.JPEG,
          compress: 0.8,
          base64: true,
        }
      );
      
      return `data:image/jpeg;base64,${manipulatedImage.base64}`;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      // Fallback to original URI if conversion fails
      return uri;
    }
  };

  const pickImage = async (source) => {
    setShowOptions(false);

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      let result;
      
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          allowsMultipleSelection: false,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        try {
          const asset = result.assets[0];
          const base64Uri = await convertToBase64(asset.uri);
          
          const newImage = {
            id: Date.now().toString(),
            uri: base64Uri,
            fileName: asset.fileName || `image_${Date.now()}.jpg`,
            type: asset.type || 'image/jpeg',
          };
          
          if (images.length < maxImages) {
            onImagesChange([...images, newImage]);
          } else {
            Alert.alert('Maximum Images', `You can only add up to ${maxImages} images per todo.`);
          }
        } catch (error) {
          console.error('Error processing image:', error);
          Alert.alert('Error', 'Failed to process image. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removeImage = (imageId) => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedImages = images.filter(img => img.id !== imageId);
            onImagesChange(updatedImages);
          },
        },
      ]
    );
  };

  const ImagePreview = ({ image, index }) => (
    <View style={styles.imagePreview}>
      <Image source={{ uri: image.uri }} style={styles.previewImage} />
      <TouchableOpacity
        style={[styles.removeImageButton, { backgroundColor: theme.colors.destructive }]}
        onPress={() => removeImage(image.id)}
      >
        <Icon name="close" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const AddImageButton = () => (
    <TouchableOpacity
      style={[
        styles.addImageButton,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={() => setShowOptions(true)}
    >
      <Icon name="add-a-photo" size={24} color={theme.colors.accent} />
      <Text style={[styles.addImageText, { color: theme.colors.textSecondary }]}>
        Add Photo
      </Text>
    </TouchableOpacity>
  );

  return (
    <View>
      {images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageContainer}
          contentContainerStyle={styles.imageScrollContent}
        >
          {images.map((image, index) => (
            <ImagePreview key={image.id} image={image} index={index} />
          ))}
          {images.length < maxImages && <AddImageButton />}
        </ScrollView>
      )}

      {images.length === 0 && <AddImageButton />}

      {/* Image Source Selection Modal */}
      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
        >
          <View style={[styles.optionsContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.optionsTitle, { color: theme.colors.textPrimary }]}>
              Add Photo
            </Text>
            
            <TouchableOpacity
              style={[styles.option, { borderBottomColor: theme.colors.border }]}
              onPress={() => pickImage('camera')}
            >
              <Icon name="camera-alt" size={24} color={theme.colors.accent} />
              <Text style={[styles.optionText, { color: theme.colors.textPrimary }]}>
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => pickImage('gallery')}
            >
              <Icon name="photo-library" size={24} color={theme.colors.accent} />
              <Text style={[styles.optionText, { color: theme.colors.textPrimary }]}>
                Choose from Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, { borderTopColor: theme.colors.border }]}
              onPress={() => setShowOptions(false)}
            >
              <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    marginTop: 8,
  },
  imageScrollContent: {
    paddingRight: 16,
  },
  imagePreview: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addImageText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    margin: 20,
    borderRadius: 12,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: screenWidth * 0.7,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 16,
    flex: 1,
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default TodoImagePicker;