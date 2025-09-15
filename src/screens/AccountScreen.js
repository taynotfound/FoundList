import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useTodos } from '../contexts/TodoContext';

const AccountScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, logout, updateProfile, changePassword, deleteAccount, isOnline } = useAuth();
  const { syncTodos, isSyncing, lastSync } = useTodos();
  const [isLoading, setIsLoading] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  // Edit Profile Modal State
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  // Change Password Modal State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Delete Account Modal State
  const [deletePassword, setDeletePassword] = useState('');

  // Animation for sync icon
  const spinValue = new Animated.Value(0);

  // Spin animation
  React.useEffect(() => {
    if (isSyncing || isLoading) {
      const spin = () => {
        spinValue.setValue(0);
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          if (isSyncing || isLoading) {
            spin();
          }
        });
      };
      spin();
    }
  }, [isSyncing, isLoading]);

  const spinInterpolate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleForcePull = async () => {
    if (!isOnline) {
      Alert.alert('Error', 'You need to be online to sync data');
      return;
    }

    if (isSyncing || isLoading) {
      Alert.alert('Info', 'Sync is already in progress');
      return;
    }

    Alert.alert(
      'Force Pull Data',
      'This will download the latest data from the server and sync your todos. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sync Now',
          onPress: async () => {
            setIsLoading(true);
            try {
              await syncTodos();
            } catch (error) {
              Alert.alert('Error', 'Failed to sync data. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await logout();
            } catch (error) {
              // Error handled by AuthContext
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    if (!editEmail.trim() || !editEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        name: editName.trim(),
        email: editEmail.toLowerCase().trim(),
      });
      setShowEditProfile(false);
    } catch (error) {
      // Error handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      // Error handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert('Error', 'Please enter your password to confirm deletion');
      return;
    }

    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await deleteAccount(deletePassword);
              setShowDeleteAccount(false);
            } catch (error) {
              // Error handled by AuthContext
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const AccountItem = ({ icon, title, subtitle, onPress, rightElement, danger = false }) => (
    <TouchableOpacity
      style={[styles.accountItem, { borderBottomColor: theme.colors.border }]}
      onPress={onPress}
      disabled={!onPress || isLoading}
    >
      <View style={styles.accountLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
          <Icon
            name={icon}
            size={20}
            color={danger ? theme.colors.destructive : theme.colors.accent}
          />
        </View>
        <View style={styles.accountText}>
          <Text style={[styles.accountTitle, { color: theme.colors.textPrimary }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.accountSubtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement || (
        onPress && (
          <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
        )
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            Account
          </Text>
        </View>

        {/* User Info */}
        <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.userInfo}>
            <View style={[styles.userAvatar, { backgroundColor: theme.colors.accent }]}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
                {user?.name || 'Unknown User'}
              </Text>
              <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
                {user?.email || 'No email'}
              </Text>
              <Text style={[styles.userSince, { color: theme.colors.textTertiary }]}>
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            ACCOUNT SETTINGS
          </Text>
          <AccountItem
            icon="edit"
            title="Edit Profile"
            subtitle="Update your name and email"
            onPress={() => setShowEditProfile(true)}
          />
          <AccountItem
            icon="lock"
            title="Change Password"
            subtitle="Update your password"
            onPress={() => setShowChangePassword(true)}
          />
        </View>

        {/* Sync Status */}
        <View style={[styles.section, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            SYNC STATUS
          </Text>
          <AccountItem
            icon={isOnline ? "cloud-done" : "cloud-off"}
            title={isOnline ? "Online" : "Offline"}
            subtitle={
              isOnline 
                ? "Your todos are syncing automatically" 
                : "Sync will resume when connection is restored"
            }
            rightElement={
              <View style={[
                styles.statusIndicator, 
                { backgroundColor: isOnline ? theme.colors.success : theme.colors.destructive }
              ]} />
            }
          />
          <AccountItem
            icon="sync"
            title="Last Sync"
            subtitle={
              lastSync 
                ? new Date(lastSync).toLocaleString()
                : "Never"
            }
          />
          <AccountItem
            icon="cloud-download"
            title={isSyncing || isLoading ? "Syncing..." : "Force Pull"}
            subtitle={
              isSyncing || isLoading
                ? "Synchronizing your data..." 
                : "Manually sync your todos from server"
            }
            onPress={(isSyncing || isLoading) ? null : handleForcePull}
            rightElement={
              (isSyncing || isLoading) ? (
                <View style={styles.loadingIndicator}>
                  <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
                    <Icon name="sync" size={16} color={theme.colors.accent} />
                  </Animated.View>
                </View>
              ) : (
                <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
              )
            }
          />
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            ACTIONS
          </Text>
          <AccountItem
            icon="logout"
            title="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
          />
          <AccountItem
            icon="delete-forever"
            title="Delete Account"
            subtitle="Permanently delete your account and all data"
            onPress={() => setShowDeleteAccount(true)}
            danger={true}
          />
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditProfile(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditProfile(false)}>
              <Text style={[styles.modalCancel, { color: theme.colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
              Edit Profile
            </Text>
            <TouchableOpacity onPress={handleUpdateProfile} disabled={isLoading}>
              <Text style={[styles.modalSave, { color: theme.colors.accent }]}>
                {isLoading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Full Name
              </Text>
              <TextInput
                style={[styles.modalInput, { 
                  backgroundColor: theme.colors.surface, 
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary 
                }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor={theme.colors.textTertiary}
                editable={!isLoading}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Email Address
              </Text>
              <TextInput
                style={[styles.modalInput, { 
                  backgroundColor: theme.colors.surface, 
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary 
                }]}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePassword}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowChangePassword(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowChangePassword(false)}>
              <Text style={[styles.modalCancel, { color: theme.colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
              Change Password
            </Text>
            <TouchableOpacity onPress={handleChangePassword} disabled={isLoading}>
              <Text style={[styles.modalSave, { color: theme.colors.accent }]}>
                {isLoading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Current Password
              </Text>
              <TextInput
                style={[styles.modalInput, { 
                  backgroundColor: theme.colors.surface, 
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary 
                }]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={theme.colors.textTertiary}
                secureTextEntry
                editable={!isLoading}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                New Password
              </Text>
              <TextInput
                style={[styles.modalInput, { 
                  backgroundColor: theme.colors.surface, 
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary 
                }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={theme.colors.textTertiary}
                secureTextEntry
                editable={!isLoading}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Confirm New Password
              </Text>
              <TextInput
                style={[styles.modalInput, { 
                  backgroundColor: theme.colors.surface, 
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary 
                }]}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                placeholder="Confirm new password"
                placeholderTextColor={theme.colors.textTertiary}
                secureTextEntry
                editable={!isLoading}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteAccount}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDeleteAccount(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDeleteAccount(false)}>
              <Text style={[styles.modalCancel, { color: theme.colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.destructive }]}>
              Delete Account
            </Text>
            <TouchableOpacity onPress={handleDeleteAccount} disabled={isLoading}>
              <Text style={[styles.modalSave, { color: theme.colors.destructive }]}>
                {isLoading ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <View style={[styles.warningBox, { backgroundColor: theme.colors.destructive + '20' }]}>
              <Icon name="warning" size={24} color={theme.colors.destructive} />
              <Text style={[styles.warningText, { color: theme.colors.destructive }]}>
                This action cannot be undone. All your data will be permanently deleted.
              </Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                Enter your password to confirm
              </Text>
              <TextInput
                style={[styles.modalInput, { 
                  backgroundColor: theme.colors.surface, 
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary 
                }]}
                value={deletePassword}
                onChangeText={setDeletePassword}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.textTertiary}
                secureTextEntry
                editable={!isLoading}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  section: {
    borderBottomWidth: 1,
    marginBottom: 32,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  userSince: {
    fontSize: 14,
    fontWeight: '400',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountText: {
    flex: 1,
  },
  accountTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  accountSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  loadingIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCancel: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});

export default AccountScreen;