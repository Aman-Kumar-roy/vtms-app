import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface AnimatedScreenWrapperProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const AnimatedScreenWrapper: React.FC<AnimatedScreenWrapperProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080d1a',
  },
});
