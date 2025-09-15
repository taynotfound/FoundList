import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';

const MarkdownDisplayer = ({ 
  content, 
  onEdit,
  showEditButton = true,
  style,
  compact = false 
}) => {
  const { theme } = useTheme();

  const getMarkdownStyles = () => ({
    body: {
      color: theme.colors.textPrimary,
      fontSize: compact ? 13 : 14,
      lineHeight: compact ? 18 : 20,
    },
    heading1: {
      color: theme.colors.textPrimary,
      fontSize: compact ? 18 : 20,
      fontWeight: 'bold',
      marginVertical: compact ? 6 : 8,
    },
    heading2: {
      color: theme.colors.textPrimary,
      fontSize: compact ? 16 : 18,
      fontWeight: '600',
      marginVertical: compact ? 4 : 6,
    },
    heading3: {
      color: theme.colors.textPrimary,
      fontSize: compact ? 14 : 16,
      fontWeight: '600',
      marginVertical: compact ? 3 : 4,
    },
    heading4: {
      color: theme.colors.textPrimary,
      fontSize: compact ? 13 : 14,
      fontWeight: '600',
      marginVertical: compact ? 2 : 4,
    },
    heading5: {
      color: theme.colors.textPrimary,
      fontSize: compact ? 12 : 12,
      fontWeight: '600',
      marginVertical: compact ? 2 : 2,
    },
    heading6: {
      color: theme.colors.textPrimary,
      fontSize: compact ? 11 : 11,
      fontWeight: '600',
      marginVertical: compact ? 1 : 2,
    },
    paragraph: {
      color: theme.colors.textPrimary,
      fontSize: compact ? 13 : 14,
      lineHeight: compact ? 18 : 20,
      marginVertical: compact ? 2 : 4,
    },
    strong: {
      color: theme.colors.textPrimary,
      fontWeight: 'bold',
    },
    em: {
      color: theme.colors.textPrimary,
      fontStyle: 'italic',
    },
    bullet_list: {
      marginVertical: compact ? 2 : 4,
    },
    ordered_list: {
      marginVertical: compact ? 2 : 4,
    },
    list_item: {
      color: theme.colors.textPrimary,
      fontSize: compact ? 13 : 14,
      lineHeight: compact ? 18 : 20,
      marginVertical: compact ? 1 : 2,
    },
    code_inline: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.accent,
      paddingHorizontal: compact ? 2 : 3,
      paddingVertical: compact ? 0 : 1,
      borderRadius: compact ? 2 : 3,
      fontSize: compact ? 11 : 12,
      fontFamily: 'monospace',
    },
    code_block: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.accent,
      padding: compact ? 6 : 8,
      borderRadius: compact ? 4 : 6,
      fontSize: compact ? 11 : 12,
      fontFamily: 'monospace',
      marginVertical: compact ? 2 : 4,
    },
    fence: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.accent,
      padding: compact ? 6 : 8,
      borderRadius: compact ? 4 : 6,
      fontSize: compact ? 11 : 12,
      fontFamily: 'monospace',
      marginVertical: compact ? 2 : 4,
    },
    link: {
      color: theme.colors.accent,
      textDecorationLine: 'underline',
    },
    blockquote: {
      backgroundColor: theme.colors.surface,
      borderLeftColor: theme.colors.accent,
      borderLeftWidth: compact ? 2 : 3,
      paddingLeft: compact ? 6 : 8,
      paddingVertical: compact ? 2 : 4,
      marginVertical: compact ? 2 : 4,
    },
    hr: {
      backgroundColor: theme.colors.border,
      height: 1,
      marginVertical: compact ? 4 : 8,
    },
  });

  const handleLinkPress = (url) => {
    try {
      Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open link:', error);
    }
  };

  if (!content || content.trim() === '') {
    return (
      <View style={[styles.emptyContainer, style]}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          No description available
        </Text>
        {showEditButton && onEdit && (
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: theme.colors.surface }]}
            onPress={onEdit}
          >
            <Icon name="edit" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.editButtonText, { color: theme.colors.textSecondary }]}>
              Add description
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.contentContainer}>
        <Markdown 
          style={getMarkdownStyles()}
          onLinkPress={handleLinkPress}
        >
          {content}
        </Markdown>
      </View>
      
      {showEditButton && onEdit && (
        <TouchableOpacity 
          style={[styles.editIconButton, { backgroundColor: theme.colors.surface }]}
          onPress={onEdit}
        >
          <Icon name="edit" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 12,
    marginLeft: 4,
  },
  editIconButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
});

export default MarkdownDisplayer;