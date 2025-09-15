import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../contexts/ThemeContext';

const MarkdownEditorViewer = ({ 
  value = '', 
  onChange, 
  placeholder = 'Enter your description...', 
  editable = true,
  showToolbar = true,
  maxHeight = 300,
  minHeight = 100,
}) => {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(value);

  // Update internal state when value prop changes
  useEffect(() => {
    setEditText(value);
  }, [value]);

  const handleSave = () => {
    if (onChange) {
      onChange(editText);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(value);
    setIsEditing(false);
  };

  // Call onChange immediately when text changes (for real-time updates)
  const handleTextChange = (text) => {
    setEditText(text);
    if (onChange) {
      onChange(text);
    }
  };

  const insertMarkdown = (before, after = '') => {
    // Simple markdown insertion for common formatting
    const newText = `${editText}${before}${after}`;
    handleTextChange(newText);
  };

  const handleLinkPress = (url) => {
    // Validate URL and open
    if (url.startsWith('http://') || url.startsWith('https://')) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Could not open link');
      });
    } else {
      Alert.alert('Invalid Link', 'Only HTTP and HTTPS links are supported');
    }
  };

  const getMarkdownStyles = () => ({
    body: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      lineHeight: 20,
    },
    heading1: {
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 8,
    },
    heading2: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '600',
      marginVertical: 6,
    },
    heading3: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',
      marginVertical: 4,
    },
    heading4: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: '600',
      marginVertical: 4,
    },
    heading5: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '600',
      marginVertical: 2,
    },
    heading6: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: '600',
      marginVertical: 2,
    },
    paragraph: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      lineHeight: 20,
      marginVertical: 4,
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
      marginVertical: 4,
    },
    ordered_list: {
      marginVertical: 4,
    },
    list_item: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      lineHeight: 20,
      marginVertical: 2,
    },
    code_inline: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.accent,
      paddingHorizontal: 3,
      paddingVertical: 1,
      borderRadius: 3,
      fontSize: 13,
      fontFamily: 'monospace',
    },
    code_block: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.accent,
      padding: 8,
      borderRadius: 6,
      fontSize: 13,
      fontFamily: 'monospace',
      marginVertical: 4,
    },
    fence: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.accent,
      padding: 8,
      borderRadius: 6,
      fontSize: 13,
      fontFamily: 'monospace',
      marginVertical: 4,
    },
    link: {
      color: theme.colors.accent,
      textDecorationLine: 'underline',
    },
    blockquote: {
      backgroundColor: theme.colors.surface,
      borderLeftColor: theme.colors.accent,
      borderLeftWidth: 3,
      paddingLeft: 8,
      paddingVertical: 4,
      marginVertical: 4,
    },
    hr: {
      backgroundColor: theme.colors.border,
      height: 1,
      marginVertical: 8,
    },
    table: {
      borderColor: theme.colors.border,
    },
    th: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.textPrimary,
      fontWeight: 'bold',
    },
    td: {
      color: theme.colors.textPrimary,
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Toolbar */}
      {showToolbar && (
        <View style={[styles.toolbar, { borderBottomColor: theme.colors.border }]}>
          {isEditing ? (
            <>
              {/* Editing mode toolbar */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolbarScroll}>
                <TouchableOpacity 
                  style={[styles.toolButton, { backgroundColor: theme.colors.surface }]}
                  onPress={() => insertMarkdown('**', '**')}
                >
                  <Icon name="format-bold" size={18} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toolButton, { backgroundColor: theme.colors.surface }]}
                  onPress={() => insertMarkdown('*', '*')}
                >
                  <Icon name="format-italic" size={18} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toolButton, { backgroundColor: theme.colors.surface }]}
                  onPress={() => insertMarkdown('\n## ', '')}
                >
                  <Text style={[styles.toolButtonText, { color: theme.colors.textPrimary }]}>H2</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toolButton, { backgroundColor: theme.colors.surface }]}
                  onPress={() => insertMarkdown('\n- ', '')}
                >
                  <Icon name="format-list-bulleted" size={18} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toolButton, { backgroundColor: theme.colors.surface }]}
                  onPress={() => insertMarkdown('\n1. ', '')}
                >
                  <Icon name="format-list-numbered" size={18} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toolButton, { backgroundColor: theme.colors.surface }]}
                  onPress={() => insertMarkdown('`', '`')}
                >
                  <Icon name="code" size={18} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toolButton, { backgroundColor: theme.colors.surface }]}
                  onPress={() => insertMarkdown('[Link Text](', ')')}
                >
                  <Icon name="link" size={18} color={theme.colors.textPrimary} />
                </TouchableOpacity>
              </ScrollView>
              
              {/* Save/Cancel buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
                  onPress={handleCancel}
                >
                  <Icon name="close" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: theme.colors.accent }]}
                  onPress={handleSave}
                >
                  <Icon name="check" size={18} color={theme.colors.surface} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* View mode toolbar */}
              <Text style={[styles.modeLabel, { color: theme.colors.textSecondary }]}>
                Description
              </Text>
              {editable && (
                <TouchableOpacity 
                  style={[styles.editButton, { backgroundColor: theme.colors.surface }]}
                  onPress={() => setIsEditing(true)}
                >
                  <Icon name="edit" size={16} color={theme.colors.textPrimary} />
                  <Text style={[styles.editButtonText, { color: theme.colors.textPrimary }]}>
                    Edit
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}

      {/* Content Area */}
      <View style={[styles.content, { minHeight, maxHeight }]}>
        {isEditing ? (
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.background,
                color: theme.colors.textPrimary,
                borderColor: theme.colors.border,
                minHeight,
                maxHeight,
              },
            ]}
            value={editText}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            textAlignVertical="top"
            autoFocus
          />
        ) : (
          <ScrollView 
            style={styles.viewer}
            showsVerticalScrollIndicator={true}
            indicatorStyle={theme.isDark ? 'white' : 'black'}
          >
            {value && value.trim() ? (
              <Markdown 
                style={getMarkdownStyles()}
                onLinkPress={handleLinkPress}
              >
                {value}
              </Markdown>
            ) : (
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {placeholder}
              </Text>
            )}
          </ScrollView>
        )}
      </View>

      {/* Help text for editing */}
      {isEditing && (
        <View style={[styles.helpContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
            Supports Markdown: **bold**, *italic*, ## headings, - lists, `code`, [links](url)
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  toolbarScroll: {
    flex: 1,
  },
  toolButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  toolButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  textInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  viewer: {
    flex: 1,
    padding: 12,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  helpContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  helpText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
});

export default MarkdownEditorViewer;