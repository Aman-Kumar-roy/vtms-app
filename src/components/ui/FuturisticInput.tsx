import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface FuturisticInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const FuturisticInput: React.FC<FuturisticInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputGroup, error ? styles.inputError : null]}>
        {leftIcon ? <View style={styles.iconMargin}>{leftIcon}</View> : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#71717a"
          {...props}
        />
        {rightIcon ? <View style={styles.iconMarginRight}>{rightIcon}</View> : null}
      </View>
      {error && <Text style={styles.errorText}>⚠️ {error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    color: '#a1a1aa',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a35',
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 14,
  },
  iconMargin: { marginRight: 10 },
  iconMarginRight: { marginLeft: 10 },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
