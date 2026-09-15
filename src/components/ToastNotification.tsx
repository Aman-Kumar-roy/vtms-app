import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

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
  duration = 2800,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible) {
      // Spring down vertically with scale and fade
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 7,
          tension: 65,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 65,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      // Auto dismiss after specified duration
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(translateY, {
        toValue: -50,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scale, {
        toValue: 0.92,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  const iconName = isSuccess
    ? 'checkmark-circle'
    : isError
    ? 'alert-circle'
    : 'information-circle';

  const accentColor = isSuccess
    ? '#10b981'
    : isError
    ? '#ef4444'
    : '#0284c7';

  const badgeBg = isSuccess
    ? 'rgba(16, 185, 129, 0.15)'
    : isError
    ? 'rgba(239, 68, 68, 0.15)'
    : 'rgba(2, 132, 199, 0.15)';

  const borderColor = isSuccess
    ? 'rgba(16, 185, 129, 0.4)'
    : isError
    ? 'rgba(239, 68, 68, 0.4)'
    : 'rgba(2, 132, 199, 0.4)';

  const topOffset = Math.max(insets.top + (Platform.OS === 'ios' ? 8 : 14), 44);

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          top: topOffset,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <View
        style={[
          styles.toastContainer,
          {
            backgroundColor: theme === 'dark' ? '#091322' : '#ffffff',
            borderColor: borderColor,
            shadowColor: accentColor,
          },
        ]}
      >
        {/* Glowing Top Accent Line */}
        <View style={[styles.topGlowLine, { backgroundColor: accentColor }]} />

        <View style={styles.toastContentRow}>
          {/* Glowing Icon Square */}
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: badgeBg,
                borderColor: borderColor,
              },
            ]}
          >
            <Ionicons name={iconName} size={20} color={accentColor} />
          </View>

          {/* Text Information */}
          <View style={styles.textContainer}>
            <View style={styles.headerTagRow}>
              <View style={[styles.tagPill, { backgroundColor: badgeBg }]}>
                <Text style={[styles.tagText, { color: accentColor }]}>
                  {isSuccess ? 'SUCCESS' : isError ? 'ATTENTION' : 'NOTICE'}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.toastMessage,
                { color: theme === 'dark' ? '#f8fafc' : '#0f172a' },
              ]}
              numberOfLines={2}
            >
              {message}
            </Text>
          </View>

          {/* Dismiss Button */}
          <TouchableOpacity
            onPress={handleDismiss}
            style={styles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close"
              size={16}
              color={theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 99999,
    elevation: 20,
    alignItems: 'center',
  },
  toastContainer: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1.2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 12,
  },
  topGlowLine: {
    height: 2.5,
    width: '100%',
    opacity: 0.85,
  },
  toastContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 6,
  },
  headerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  tagPill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  toastMessage: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
});
