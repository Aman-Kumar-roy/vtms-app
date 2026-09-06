import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Animated, Easing } from 'react-native';
import { NavigationProgressBar } from './NavigationProgressBar';

export type ScreenAnimationDirection = 'up' | 'down' | 'left' | 'right' | 'fade' | 'none';

interface AnimatedScreenWrapperProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  direction?: ScreenAnimationDirection;
  duration?: number;
  showTopLoader?: boolean;
}

export const AnimatedScreenWrapper: React.FC<AnimatedScreenWrapperProps> = ({
  children,
  style,
  direction = 'up',
  duration = 240,
  showTopLoader = true,
}) => {
  const animTranslate = useRef(new Animated.Value(0)).current;
  const animOpacity = useRef(new Animated.Value(direction === 'none' ? 1 : 0.25)).current;

  useEffect(() => {
    if (direction === 'none') return;

    // Set initial offset based on direction
    const offsetDistance = 24;
    let initialOffset = 0;

    if (direction === 'up') initialOffset = offsetDistance;
    else if (direction === 'down') initialOffset = -offsetDistance;
    else if (direction === 'right') initialOffset = offsetDistance;
    else if (direction === 'left') initialOffset = -offsetDistance;

    animTranslate.setValue(initialOffset);
    animOpacity.setValue(0.2);

    Animated.parallel([
      Animated.timing(animTranslate, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(animOpacity, {
        toValue: 1,
        duration: Math.round(duration * 0.9),
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [direction, duration, animTranslate, animOpacity]);

  const isHorizontal = direction === 'left' || direction === 'right';
  const transformStyle = direction === 'none' || direction === 'fade'
    ? []
    : isHorizontal
    ? [{ translateX: animTranslate }]
    : [{ translateY: animTranslate }];

  return (
    <View style={styles.outerContainer}>
      {showTopLoader && (
        <NavigationProgressBar
          direction={direction === 'left' ? 'right-to-left' : 'left-to-right'}
        />
      )}
      <Animated.View
        style={[
          styles.container,
          {
            opacity: animOpacity,
            transform: transformStyle,
          },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#080d1a',
  },
  container: {
    flex: 1,
    backgroundColor: '#080d1a',
  },
});
