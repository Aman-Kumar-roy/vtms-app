import React from 'react';
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
import { useTheme } from '../context/ThemeContext';
import { User } from '../types';

interface SignOutConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user?: User | null;
}

export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  user,
}) => {
  const { colors, theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme === 'dark' ? '#091322' : '#ffffff',
                  borderColor: 'rgba(239, 68, 68, 0.35)',
                  shadowColor: '#ef4444',
                },
              ]}
            >
              {/* Glowing Top Amber/Rose Line */}
              <View style={styles.topAccentGlow} />

              <View style={styles.cardContent}>
                {/* Glowing Rose Icon Circle */}
                <View style={styles.iconCircle}>
                  <Ionicons name="log-out-outline" size={28} color="#ef4444" />
                </View>

                {/* Title & Subtitle */}
                <Text
                  style={[
                    styles.title,
                    { color: theme === 'dark' ? '#f8fafc' : '#0f172a' },
                  ]}
                >
                  Sign Out of Account
                </Text>

                <Text
                  style={[
                    styles.message,
                    { color: colors.textMuted },
                  ]}
                >
                  Are you sure you want to end your current session? You will need to sign back in with your credentials to access VTMS data.
                </Text>

                {/* Logged in User Profile Pill */}
                {user ? (
                  <View
                    style={[
                      styles.userPill,
                      {
                        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                        borderColor: colors.borderSubtle,
                      },
                    ]}
                  >
                    <View style={styles.avatarMini}>
                      <Text style={styles.avatarMiniText}>
                        {(user.name || user.email || 'A')[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.userPillTextGroup}>
                      <Text
                        style={[
                          styles.userPillName,
                          { color: colors.textPrimary },
                        ]}
                        numberOfLines={1}
                      >
                        {user.name || 'Administrator'}
                      </Text>
                      <Text
                        style={[styles.userPillEmail, { color: colors.textMuted }]}
                        numberOfLines={1}
                      >
                        {user.email}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[
                      styles.cancelBtn,
                      {
                        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
                        borderColor: colors.borderSubtle,
                      },
                    ]}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.cancelBtnText, { color: colors.textPrimary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.signOutBtn}
                    onPress={onConfirm}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="log-out" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.signOutBtnText}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1.2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 16,
  },
  topAccentGlow: {
    height: 3,
    width: '100%',
    backgroundColor: '#ef4444',
    opacity: 0.9,
  },
  cardContent: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1.2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarMiniText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '800',
  },
  userPillTextGroup: {
    flex: 1,
  },
  userPillName: {
    fontSize: 12,
    fontWeight: '700',
  },
  userPillEmail: {
    fontSize: 11,
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  signOutBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signOutBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
