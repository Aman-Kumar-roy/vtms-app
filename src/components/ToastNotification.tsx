import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToastNotificationProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onDismiss: () => void;
  duration?: number;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  visible,
  message,
  type = 'success',
  onDismiss,
  duration = 2600,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      // Fade in & slide down
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      // Auto dismiss after specified duration
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 220,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]).start(() => {
          onDismiss();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, opacity, translateY, duration, onDismiss]);

  if (!visible) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  const iconName = isSuccess
    ? 'checkmark-circle'
    : isError
    ? 'alert-circle'
    : 'information-circle';

  const bgColor = isSuccess
    ? '#064e3b'
    : isError
    ? '#7f1d1d'
    : '#0c4a6e';

  const borderColor = isSuccess
    ? '#059669'
    : isError
    ? '#dc2626'
    : '#0284c7';

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Ionicons
        name={iconName}
        size={18}
        color="#ffffff"
        style={{ marginRight: 8 }}
      />
      <Text style={styles.toastText} numberOfLines={2}>
        {message}
      </Text>
      <TouchableOpacity onPress={onDismiss} style={styles.closeHitSlop}>
        <Ionicons name="close" size={16} color="rgba(255, 255, 255, 0.7)" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 50 : 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  toastText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  closeHitSlop: {
    padding: 4,
    marginLeft: 6,
  },
});
