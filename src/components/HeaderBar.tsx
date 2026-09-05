import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/theme';

interface HeaderBarProps {
  title?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ title }) => {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'VT';

  return (
    <View style={styles.header}>
      {/* Left: User Avatar & Greetings */}
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.userTextGroup}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{user?.name || 'VTMS Admin'}</Text>
            <View style={styles.liveDot} />
          </View>
          <Text style={styles.userRole}>{user?.role || 'SDET / Admin Operator'}</Text>
        </View>
      </View>

      {/* Right: Logout Icon Button */}
      <TouchableOpacity
        style={styles.logoutIconButton}
        onPress={logout}
        activeOpacity={0.7}
        accessibilityLabel="Logout"
      >
        <View style={styles.logoutIconGraphic}>
          <Text style={styles.logoutIconSymbol}>🚪</Text>
        </View>
        <Text style={styles.logoutLabel}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardDark,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#38bdf8',
  },
  avatarText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  userTextGroup: {
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    color: Colors.textLight,
    fontSize: 15,
    fontWeight: '700',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  userRole: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  logoutIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutIconGraphic: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIconSymbol: {
    fontSize: 14,
  },
  logoutLabel: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
});
