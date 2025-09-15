import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../contexts/ThemeContext';

const ChangelogModal = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const [release, setRelease] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible) {
      fetchLatestRelease();
    }
  }, [visible]);

  const fetchLatestRelease = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://api.github.com/repos/taynotfound/FoundList/releases/latest');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setRelease(data);
    } catch (err) {
      console.error('Failed to fetch release:', err);
      setError(err.message || 'Failed to load changelog');
    } finally {
      setLoading(false);
    }
  };

  const formatReleaseBody = (body) => {
    if (!body) return '';
    // Keep the original markdown formatting for the markdown renderer
    return body.trim();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const openReleaseOnGitHub = () => {
    if (release?.html_url) {
      Linking.openURL(release.html_url);
    }
  };

  const getMarkdownStyles = () => ({
    body: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      lineHeight: 24,
    },
    heading1: {
      color: theme.colors.textPrimary,
      fontSize: 24,
      fontWeight: 'bold',
      marginVertical: 16,
    },
    heading2: {
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: '600',
      marginVertical: 14,
    },
    heading3: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '600',
      marginVertical: 12,
    },
    heading4: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',
      marginVertical: 10,
    },
    heading5: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '600',
      marginVertical: 8,
    },
    heading6: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: '600',
      marginVertical: 6,
    },
    paragraph: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      lineHeight: 24,
      marginVertical: 8,
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
      marginVertical: 8,
    },
    ordered_list: {
      marginVertical: 8,
    },
    list_item: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      lineHeight: 24,
      marginVertical: 4,
    },
    code_inline: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.accent,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 14,
      fontFamily: 'monospace',
    },
    code_block: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.accent,
      padding: 12,
      borderRadius: 8,
      fontSize: 14,
      fontFamily: 'monospace',
      marginVertical: 8,
    },
    fence: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.accent,
      padding: 12,
      borderRadius: 8,
      fontSize: 14,
      fontFamily: 'monospace',
      marginVertical: 8,
    },
    link: {
      color: theme.colors.accent,
      textDecorationLine: 'underline',
    },
    blockquote: {
      backgroundColor: theme.colors.surface,
      borderLeftColor: theme.colors.accent,
      borderLeftWidth: 4,
      paddingLeft: 12,
      paddingVertical: 8,
      marginVertical: 8,
    },
    hr: {
      backgroundColor: theme.colors.border,
      height: 1,
      marginVertical: 16,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            What's New
          </Text>
          {release && (
            <TouchableOpacity style={styles.githubButton} onPress={openReleaseOnGitHub}>
              <Icon name="open-in-new" size={20} color={theme.colors.accent} />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={true}
          indicatorStyle={theme.isDark ? 'white' : 'black'}
        >
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.accent} />
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                Loading changelog...
              </Text>
            </View>
          )}

          {error && (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.surface }]}>
              <Icon name="error-outline" size={32} color={theme.colors.destructive} />
              <Text style={[styles.errorTitle, { color: theme.colors.destructive }]}>
                Failed to Load Changelog
              </Text>
              <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>
                {error}
              </Text>
              <TouchableOpacity 
                style={[styles.retryButton, { backgroundColor: theme.colors.accent }]}
                onPress={fetchLatestRelease}
              >
                <Text style={[styles.retryButtonText, { color: theme.colors.surface }]}>
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {release && !loading && !error && (
            <View style={[styles.releaseContainer, { backgroundColor: theme.colors.surface }]}>
              {/* Release Header */}
              <View style={styles.releaseHeader}>
                <Text style={[styles.releaseTitle, { color: theme.colors.textPrimary }]}>
                  {release.name || release.tag_name}
                </Text>
                <View style={styles.releaseMetadata}>
                  <View style={[styles.versionBadge, { backgroundColor: theme.colors.accent }]}>
                    <Text style={[styles.versionText, { color: theme.colors.surface }]}>
                      {release.tag_name}
                    </Text>
                  </View>
                  <Text style={[styles.releaseDate, { color: theme.colors.textSecondary }]}>
                    Released {formatDate(release.published_at)}
                  </Text>
                </View>
              </View>

              {/* Release Notes */}
              <View style={styles.releaseBody}>
                {release.body ? (
                  <Markdown 
                    style={getMarkdownStyles()}
                    onLinkPress={(url) => {
                      Linking.openURL(url);
                    }}
                  >
                    {formatReleaseBody(release.body)}
                  </Markdown>
                ) : (
                  <Text style={[styles.noNotesText, { color: theme.colors.textSecondary }]}>
                    No release notes available.
                  </Text>
                )}
              </View>

              {/* Assets Info */}
              {release.assets && release.assets.length > 0 && (
                <View style={styles.assetsContainer}>
                  <Text style={[styles.assetsTitle, { color: theme.colors.textSecondary }]}>
                    Downloads: {release.assets.reduce((sum, asset) => sum + asset.download_count, 0)} total
                  </Text>
                </View>
              )}

              {/* GitHub Link */}
              <TouchableOpacity 
                style={[styles.githubLinkButton, { borderColor: theme.colors.border }]}
                onPress={openReleaseOnGitHub}
              >
                <Icon name="open-in-new" size={20} color={theme.colors.accent} />
                <Text style={[styles.githubLinkText, { color: theme.colors.accent }]}>
                  View on GitHub
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Stay updated with the latest features and improvements!
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  githubButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  releaseContainer: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  releaseHeader: {
    marginBottom: 20,
  },
  releaseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  releaseMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  versionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  releaseDate: {
    fontSize: 14,
    marginBottom: 8,
  },
  releaseBody: {
    marginBottom: 20,
  },
  noNotesText: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  assetsContainer: {
    marginBottom: 20,
  },
  assetsTitle: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  githubLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  githubLinkText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default ChangelogModal;