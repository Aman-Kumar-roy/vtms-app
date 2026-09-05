import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VasudhaLogoProps {
  size?: number;
  showText?: boolean;
  subtext?: string;
}

export const VasudhaLogo: React.FC<VasudhaLogoProps> = ({
  size = 64,
  showText = true,
  subtext = 'Vendor & Transaction Operations Hub',
}) => {
  return (
    <View style={styles.container}>
      {/* Outer Glow & Professional Vector Ring */}
      <View
        style={[
          styles.glowRing,
          {
            width: size + 8,
            height: size + 8,
            borderRadius: (size + 8) / 2,
          },
        ]}
      >
        <View
          style={[
            styles.innerBadge,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          {/* Layered Vector Icon Motif */}
          <Ionicons name="cube" size={Math.round(size * 0.44)} color="#38bdf8" />
          <View style={styles.monogramBadge}>
            <Text style={styles.monogramText}>VP</Text>
          </View>
        </View>
      </View>

      {showText ? (
        <View style={styles.textContainer}>
          <Text style={styles.mainTitle}>Vasudha Polymer</Text>
          {subtext ? <Text style={styles.subtitle}>{subtext}</Text> : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  glowRing: {
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  innerBadge: {
    backgroundColor: '#070b14',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    position: 'relative',
  },
  monogramBadge: {
    position: 'absolute',
    bottom: 2,
    backgroundColor: '#0284c7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  monogramText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  mainTitle: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
});
