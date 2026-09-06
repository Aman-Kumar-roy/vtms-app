import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { useIsFetching } from '@tanstack/react-query';
import { useTheme } from '../context/ThemeContext';

interface NavigationProgressBarProps {
  isNavigating?: boolean;
  direction?: 'left-to-right' | 'right-to-left';
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BEAM_WIDTH = SCREEN_WIDTH * 0.45;

export const NavigationProgressBar: React.FC<NavigationProgressBarProps> = ({
  isNavigating = false,
  direction = 'left-to-right',
}) => {
  const { colors } = useTheme();
  const isFetchingCount = useIsFetching();
  const isLoading = isNavigating || isFetchingCount > 0;

  const animX = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Fade in smoothly
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }).start();

      // Configure directional sweep
      const isRTL = direction === 'right-to-left';
      const startVal = isRTL ? SCREEN_WIDTH : -BEAM_WIDTH;
      const endVal = isRTL ? -BEAM_WIDTH : SCREEN_WIDTH;

      animX.setValue(startVal);

      if (loopRef.current) loopRef.current.stop();

      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(animX, {
            toValue: endVal,
            duration: 650,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(animX, {
            toValue: startVal,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      loopRef.current.start();
    } else {
      // Fade out gracefully
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        if (loopRef.current) {
          loopRef.current.stop();
          loopRef.current = null;
        }
      });
    }

    return () => {
      if (loopRef.current) {
        loopRef.current.stop();
      }
    };
  }, [isLoading, direction, animX, opacityAnim]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          backgroundColor: 'rgba(8, 13, 26, 0.4)',
        },
      ]}
    >
      <Animated.View
        style={[
          styles.beam,
          {
            width: BEAM_WIDTH,
            transform: [{ translateX: animX }],
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: -16,
    right: -16,
    height: 2.5,
    overflow: 'hidden',
    zIndex: 999,
  },
  beam: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 2,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 4,
  },
});
