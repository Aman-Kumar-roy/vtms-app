import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

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
      {/* Outer Glow & Professional Brand Ring */}
      <View
        style={[
          styles.glowRing,
          {
            width: size + 8,
            height: size + 8,
            borderRadius: Math.round((size + 8) / 3),
          },
        ]}
      >
        <View
          style={[
            styles.innerBadge,
            {
              width: size,
              height: size,
              borderRadius: Math.round(size / 3),
            },
          ]}
        >
          {/* Official App Logo */}
          <Image
            source={require('../../assets/logo.jpg')}
            style={{
              width: size,
              height: size,
              borderRadius: Math.round(size / 3),
            }}
            resizeMode="cover"
          />
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
    backgroundColor: 'rgba(2, 132, 199, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.5)',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    padding: 2,
  },
  innerBadge: {
    backgroundColor: '#070b14',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 12,
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

