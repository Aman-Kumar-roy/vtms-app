import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface FuturisticCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  glowing?: boolean;
}

export const FuturisticCard: React.FC<FuturisticCardProps> = ({
  children,
  onPress,
  style,
  glowing = false,
}) => {
  const cardStyle = [
    styles.card,
    glowing && styles.glowingCard,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#121218',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2a2a35',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  glowingCard: {
    borderColor: 'rgba(99, 102, 241, 0.4)',
    shadowColor: '#6366f1',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
});
