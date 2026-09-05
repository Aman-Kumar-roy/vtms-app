import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 64, showText = false }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, { width: size, height: size, borderRadius: size / 4 }]}>
        {/* Modern Vending Machine / Hydro Vending Emblem */}
        <View style={styles.topBar} />
        <View style={styles.dispenserScreen}>
          <Text style={styles.dispenserText}>V</Text>
        </View>
        <View style={styles.nozzleGroup}>
          <View style={styles.nozzle} />
          <View style={styles.dropIcon} />
        </View>
      </View>

      {showText ? (
        <View style={styles.textContainer}>
          <Text style={styles.brandTitle}>VTMS<Text style={styles.brandAccent}>PRO</Text></Text>
          <Text style={styles.brandSubtitle}>Vendor & Vending Manager</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  iconBox: {
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  topBar: {
    position: 'absolute',
    top: 6,
    width: '60%',
    height: 4,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  dispenserScreen: {
    width: '50%',
    height: '35%',
    backgroundColor: '#0f172a',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  dispenserText: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '900',
  },
  nozzleGroup: {
    alignItems: 'center',
    marginTop: 4,
  },
  nozzle: {
    width: 8,
    height: 4,
    backgroundColor: '#94a3b8',
    borderRadius: 1,
  },
  dropIcon: {
    width: 6,
    height: 6,
    backgroundColor: '#10b981',
    borderRadius: 3,
    marginTop: 2,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  brandTitle: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  brandAccent: {
    color: '#2563eb',
  },
  brandSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
