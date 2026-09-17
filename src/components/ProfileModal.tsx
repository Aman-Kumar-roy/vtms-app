import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/theme';
import { SignOutConfirmModal } from './SignOutConfirmModal';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onClose }) => {
  const { user, logout } = useAuth();
  const { colors, theme, setTheme } = useTheme();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  if (!visible) return null;

  const initials = user?.name
    ? user.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
    : 'AD';

  const userRole = (user?.role || 'Administrator').toUpperCase();
  const userName = user?.name || 'Administrator';
  const userEmail = user?.email || 'admin@vasudhapolymer.com';

  const handleLogout = () => {
    setShowSignOutConfirm(true);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => { }}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              {/* Header Bar */}
              <View style={[styles.headerRow, { borderBottomColor: colors.borderSubtle }]}>
                <View style={styles.headerTitleGroup}>
                  <Ionicons name="person-circle-outline" size={18} color="#38bdf8" />
                  <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    User Account
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.closeBtn, { backgroundColor: colors.bgSecondary }]}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Profile Hero */}
              <View style={styles.heroSection}>
                <View style={styles.avatarGlowContainer}>
                  <View style={styles.avatarRing}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                  <View style={[styles.activeDot, { borderColor: theme === 'dark' ? '#0f172a' : '#ffffff' }]} />
                </View>

                <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {userName}
                </Text>
                <Text style={[styles.userEmail, { color: colors.textMuted }]} numberOfLines={1}>
                  {userEmail}
                </Text>

                <View style={styles.roleBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#0284c7" style={{ marginRight: 4 }} />
                  <Text style={styles.roleText}>{userRole}</Text>
                </View>
              </View>

              {/* Organization & System Info */}
              <View
                style={[
                  styles.infoContainer,
                  {
                    backgroundColor: theme === 'dark' ? colors.bgSecondary : 'rgba(15, 23, 42, 0.04)',
                    borderColor: theme === 'dark' ? colors.borderSubtle : 'rgba(15, 23, 42, 0.08)',
                  },
                ]}
              >
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Organization</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>Vasudha Polymer</Text>
                </View>
                <View style={[styles.infoDivider, { backgroundColor: theme === 'dark' ? colors.borderSubtle : 'rgba(15, 23, 42, 0.08)' }]} />
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>System Role</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{userRole}</Text>
                </View>
                <View style={[styles.infoDivider, { backgroundColor: theme === 'dark' ? colors.borderSubtle : 'rgba(15, 23, 42, 0.08)' }]} />
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>App Version</Text>
                  <Text style={[styles.infoValue, { color: colors.textMuted }]}>
                    v{Constants?.expoConfig?.version || '1.3.0'} (Expo SDK 57)
                  </Text>
                </View>
              </View>

              {/* Theme Preferences */}
              <View
                style={[
                  styles.infoContainer,
                  {
                    backgroundColor: theme === 'dark' ? colors.bgSecondary : 'rgba(15, 23, 42, 0.04)',
                    borderColor: theme === 'dark' ? colors.borderSubtle : 'rgba(15, 23, 42, 0.08)',
                    marginTop: 10,
                  },
                ]}
              >
                <View style={[styles.infoRow, { alignItems: 'center', justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons
                      name={theme === 'dark' ? 'moon' : 'sunny'}
                      size={18}
                      color={theme === 'dark' ? '#38bdf8' : '#f59e0b'}
                    />
                    <View>
                      <Text style={[styles.infoLabel, { color: colors.textPrimary, fontWeight: '700', fontSize: 13 }]}>
                        Appearance
                      </Text>
                      <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 1 }}>
                        {theme === 'dark' ? 'Dark Mode (Active)' : 'Light Mode (Active)'}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.segmentedToggle,
                      {
                        backgroundColor: theme === 'dark' ? colors.bgPrimary : 'rgba(15, 23, 42, 0.06)',
                        borderColor: theme === 'dark' ? colors.borderSubtle : 'rgba(15, 23, 42, 0.1)',
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.segmentBtn,
                        theme === 'dark' && { backgroundColor: colors.accent, borderColor: colors.accent },
                      ]}
                      onPress={() => setTheme('dark')}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="moon" size={12} color={theme === 'dark' ? '#ffffff' : colors.textMuted} style={{ marginRight: 4 }} />
                      <Text style={[styles.segmentBtnText, { color: theme === 'dark' ? '#ffffff' : colors.textMuted }]}>Dark</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.segmentBtn,
                        theme === 'light' && { backgroundColor: colors.accent, borderColor: colors.accent },
                      ]}
                      onPress={() => setTheme('light')}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="sunny" size={12} color={theme === 'light' ? '#ffffff' : colors.textMuted} style={{ marginRight: 4 }} />
                      <Text style={[styles.segmentBtnText, { color: theme === 'light' ? '#ffffff' : colors.textMuted }]}>Light</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Sign Out Button */}
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={18} color="#ef4444" style={{ marginRight: 8 }} />
                <Text style={styles.logoutBtnText}>Sign Out of Account</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* Custom Sleek Sign Out Confirmation Dialog */}
      <SignOutConfirmModal
        visible={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={() => {
          setShowSignOutConfirm(false);
          onClose();
          logout();
        }}
        user={user}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  avatarGlowContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#38bdf8',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2.5,
    borderColor: '#0f172a',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    marginBottom: 10,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 0.6,
  },
  infoContainer: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    marginBottom: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  infoDivider: {
    height: 1,
    width: '100%',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
  },
  logoutBtnText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700',
  },
  themePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  themePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  segmentedToggle: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    gap: 4,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
