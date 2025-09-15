import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../contexts/ThemeContext';
import ChangelogModal from '../components/ChangelogModal';

const AboutScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [showChangelog, setShowChangelog] = useState(false);

  const openWebsite = () => {
    Linking.openURL('https://taymaerz.de');
  };

  const openGitHub = () => {
    Linking.openURL('https://github.com/taynotfound/FoundList');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          About FoundList
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={true}
        indicatorStyle={theme.isDark ? 'white' : 'black'}
        scrollIndicatorInsets={{ right: 2 }}
      >
        {/* App Info */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.appName, { color: theme.colors.accent }]}>
            FoundList
          </Text>
          <TouchableOpacity 
            style={styles.versionButton}
            onPress={() => setShowChangelog(true)}
          >
            <Text style={[styles.version, { color: theme.colors.textSecondary }]}>
              Version 1.0.0
            </Text>
            <Icon name="info" size={16} color={theme.colors.textSecondary} style={styles.versionIcon} />
          </TouchableOpacity>
          <Text style={[styles.description, { color: theme.colors.textPrimary }]}>
            A comprehensive todo application with image attachments, themes, and search functionality
          </Text>
        </View>

        {/* Developer Info */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Developer
          </Text>
          <Text style={[styles.developer, { color: theme.colors.textPrimary }]}>
            Tay März
          </Text>
          <TouchableOpacity style={styles.linkButton} onPress={openWebsite}>
            <Icon name="language" size={20} color={theme.colors.accent} />
            <Text style={[styles.linkText, { color: theme.colors.accent }]}>
              taymaerz.de
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={openGitHub}>
            <Icon name="code" size={20} color={theme.colors.accent} />
            <Text style={[styles.linkText, { color: theme.colors.accent }]}>
              GitHub Repository
            </Text>
          </TouchableOpacity>
        </View>

        {/* License Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            License & Copyright
          </Text>
          <Text style={[styles.copyright, { color: theme.colors.textPrimary }]}>
            © {new Date().getFullYear()} Tay März
          </Text>
          <Text style={[styles.licenseText, { color: theme.colors.textSecondary }]}>
            Licensed under the MIT License
          </Text>
        </View>

        {/* Support Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Support & Feedback
          </Text>
          <TouchableOpacity style={styles.linkButton} onPress={() => Linking.openURL('https://discord.gg/C2bAXnYXzm')}>
            <Icon name="chat" size={20} color={theme.colors.accent} />
            <Text style={[styles.linkText, { color: theme.colors.accent }]}>
              Join Discord Support Server
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={openWebsite}>
            <Icon name="contact-mail" size={20} color={theme.colors.accent} />
            <Text style={[styles.linkText, { color: theme.colors.accent }]}>
              Contact Form on Website
            </Text>
          </TouchableOpacity>
          <Text style={[styles.supportText, { color: theme.colors.textSecondary }]}>
            Found a bug or have a feature request? Join our Discord community or use the contact form on taymaerz.de.
          </Text>
        </View>

        {/* License Terms */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Usage Terms
          </Text>
          
          <View style={styles.termItem}>
            <Icon name="check-circle" size={16} color={theme.colors.success} />
            <Text style={[styles.termText, { color: theme.colors.textPrimary }]}>
              Free to use, modify, and distribute
            </Text>
          </View>
          
          <View style={styles.termItem}>
            <Icon name="info" size={16} color={theme.colors.accent} />
            <Text style={[styles.termText, { color: theme.colors.textPrimary }]}>
              Attribution required in all copies
            </Text>
          </View>
          
          <View style={styles.termItem}>
            <Icon name="cancel" size={16} color={theme.colors.destructive} />
            <Text style={[styles.termText, { color: theme.colors.textPrimary }]}>
              No reselling without permission
            </Text>
          </View>
          
          <View style={styles.termItem}>
            <Icon name="cancel" size={16} color={theme.colors.destructive} />
            <Text style={[styles.termText, { color: theme.colors.textPrimary }]}>
              No closed source commercial use
            </Text>
          </View>
          
          <View style={styles.termItem}>
            <Icon name="cancel" size={16} color={theme.colors.destructive} />
            <Text style={[styles.termText, { color: theme.colors.textPrimary }]}>
              Cannot claim as your own work
            </Text>
          </View>
        </View>

        {/* Full License Text */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            MIT License
          </Text>
          <Text style={[styles.fullLicense, { color: theme.colors.textSecondary }]}>
            Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
            {'\n\n'}
            1. Attribution: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
            {'\n\n'}
            2. No Reselling: The Software may not be sold or resold without explicit permission from the copyright holder.
            {'\n\n'}
            3. No Claim of Ownership: The Software may not be claimed as your own or used in a manner that suggests you are the original author.
            {'\n\n'}
            4. No Redistribution: The Software may not be redistributed without prior knowledge and consent from the copyright holder.
            {'\n\n'}
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Thank you for using FoundList!
          </Text>
        </View>
      </ScrollView>

      {/* Changelog Modal */}
      <ChangelogModal 
        visible={showChangelog}
        onClose={() => setShowChangelog(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  versionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  versionIcon: {
    marginLeft: 6,
    marginTop: -1, // Slight adjustment to align with text baseline
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  developer: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 16,
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
  copyright: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  licenseText: {
    fontSize: 16,
  },
  supportText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  termText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  fullLicense: {
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default AboutScreen;