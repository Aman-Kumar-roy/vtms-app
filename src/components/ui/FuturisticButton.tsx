import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';

interface FuturisticButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'gradient' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const FuturisticButton: React.FC<FuturisticButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'secondary':
        return styles.secondary;
      case 'gradient':
        return styles.gradient;
      case 'danger':
        return styles.danger;
      case 'ghost':
        return styles.ghost;
      default:
        return styles.primary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'ghost':
        return styles.ghostText;
      case 'secondary':
        return styles.secondaryText;
      default:
        return styles.btnText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.baseBtn,
        getVariantStyle(),
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        (disabled || isLoading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon ? <View style={styles.iconMargin}>{leftIcon}</View> : null}
          <Text style={[getTextStyle(), styles[`text_${size}`]]}>{children}</Text>
          {rightIcon ? <View style={styles.iconMarginRight}>{rightIcon}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseBtn: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconMargin: { marginRight: 8 },
  iconMarginRight: { marginLeft: 8 },
  primary: {
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  gradient: {
    backgroundColor: '#0284c7',
    borderWidth: 1,
    borderColor: '#38bdf8',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  secondary: {
    backgroundColor: '#121218',
    borderWidth: 1,
    borderColor: '#2a2a35',
  },
  danger: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  btnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  ghostText: {
    color: '#a1a1aa',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  size_sm: { paddingVertical: 8, paddingHorizontal: 12 },
  size_md: { paddingVertical: 12, paddingHorizontal: 16 },
  size_lg: { paddingVertical: 16, paddingHorizontal: 24 },
  text_sm: { fontSize: 12 },
  text_md: { fontSize: 14 },
  text_lg: { fontSize: 16 },
});
