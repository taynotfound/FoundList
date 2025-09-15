import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../contexts/ThemeContext';

const MarkdownEditor = ({ 
  value, 
  onChangeText, 
  placeholder = "Enter description...",
  minHeight = 120,
  maxHeight = 300,
  showPreview = true 
}) => {
  const { theme } = useTheme();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [textInputHeight, setTextInputHeight] = useState(minHeight);

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
      fontSize: 14,
      fontWeight: '600',
      marginVertical: 4,
    },
    heading5: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: '600',
      marginVertical: 2,
    },
    heading6: {
      color: theme.colors.textPrimary,
      fontSize: 11,
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
      fontSize: 12,
      fontFamily: 'monospace',
    },
    code_block: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.accent,
      padding: 8,
      borderRadius: 6,
      fontSize: 12,
      fontFamily: 'monospace',
      marginVertical: 4,
    },
    fence: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.accent,
      padding: 8,
      borderRadius: 6,
      fontSize: 12,
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
  });

  const insertMarkdown = (syntax) => {
    if (!value) {
      onChangeText(syntax);
      return;
    }

    const newText = value + syntax;
    onChangeText(newText);
  };

  const ToolbarButton = ({ icon, onPress, tooltip }) => (
    <TouchableOpacity
      style={[styles.toolbarButton, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <Icon name={icon} size={18} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={[styles.toolbar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarContent}>
          <ToolbarButton icon="format-bold" onPress={() => insertMarkdown('**bold**')} />
          <ToolbarButton icon="format-italic" onPress={() => insertMarkdown('*italic*')} />
          <ToolbarButton icon="format-list-bulleted" onPress={() => insertMarkdown('\n- List item')} />
          <ToolbarButton icon="format-list-numbered" onPress={() => insertMarkdown('\n1. List item')} />
          <ToolbarButton icon="link" onPress={() => insertMarkdown('[link text](url)')} />
          <ToolbarButton icon="code" onPress={() => insertMarkdown('`code`')} />
          <ToolbarButton icon="format-quote" onPress={() => insertMarkdown('\n> Quote')} />
          <ToolbarButton icon="title" onPress={() => insertMarkdown('\n## Heading')} />
        </ScrollView>
        
        {showPreview && (
          <TouchableOpacity
            style={[
              styles.previewToggle,
              { 
                backgroundColor: isPreviewMode ? theme.colors.accent : theme.colors.surface,
                borderColor: theme.colors.border
              }
            ]}
            onPress={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Icon 
              name={isPreviewMode ? "edit" : "visibility"} 
              size={18} 
              color={isPreviewMode ? theme.colors.surface : theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Editor/Preview Area */}
      <View style={[
        styles.editorContainer, 
        { 
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          minHeight: minHeight,
          maxHeight: maxHeight
        }
      ]}>
        {isPreviewMode ? (
          <ScrollView style={styles.previewScroll} showsVerticalScrollIndicator={true}>
            {value ? (
              <Markdown 
                style={getMarkdownStyles()}
                onLinkPress={(url) => {
                  // Handle link press
                  console.log('Link pressed:', url);
                }}
              >
                {value}
              </Markdown>
            ) : (
              <Text style={[styles.previewPlaceholder, { color: theme.colors.textSecondary }]}>
                Nothing to preview yet. Start typing to see the preview.
              </Text>
            )}
          </ScrollView>
        ) : (
          <TextInput
            style={[
              styles.textInput,
              {
                color: theme.colors.textPrimary,
                height: Math.max(minHeight, Math.min(textInputHeight, maxHeight)),
              }
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            textAlignVertical="top"
            onContentSizeChange={(event) => {
              setTextInputHeight(event.nativeEvent.contentSize.height + 20);
            }}
          />
        )}
      </View>

      {/* Help Text */}
      <Text style={[styles.helpText, { color: theme.colors.textTertiary }]}>
        {isPreviewMode 
          ? "Tap edit icon to continue editing" 
          : "Use toolbar for formatting or type markdown directly"
        }
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  toolbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  toolbarButton: {
    padding: 8,
    marginRight: 4,
    borderRadius: 6,
  },
  previewToggle: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 8,
  },
  editorContainer: {
    borderWidth: 1,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
  },
  textInput: {
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'System',
  },
  previewScroll: {
    padding: 12,
    flex: 1,
  },
  previewPlaceholder: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  helpText: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default MarkdownEditor;