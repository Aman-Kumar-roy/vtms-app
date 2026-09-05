import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface FuturisticBadgeProps {
  children: React.ReactNode;
  variant?: 'active' | 'overdue' | 'partial' | 'info' | 'neutral' | 'core' | 'new' | 'soon';
}

export const FuturisticBadge: React.FC<FuturisticBadgeProps> = ({
  children,
  variant = 'neutral',
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'active':
        return styles.badgeActive;
      case 'overdue':
        return styles.badgeOverdue;
      case 'partial':
        return styles.badgePartial;
      case 'info':
        return styles.badgeInfo;
      case 'core':
        return styles.badgeCore;
      case 'new':
        return styles.badgeNew;
      case 'soon':
        return styles.badgeSoon;
      default:
        return styles.badgeNeutral;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'active':
        return styles.textActive;
      case 'overdue':
        return styles.textOverdue;
      case 'partial':
        return styles.textPartial;
      case 'info':
      case 'core':
        return styles.textCore;
      case 'new':
        return styles.textNew;
      case 'soon':
        return styles.textSoon;
      default:
        return styles.textNeutral;
    }
  };

  return (
    <View style={[styles.baseBadge, getBadgeStyle()]}>
      <Text style={[styles.baseText, getTextStyle()]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  baseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  baseText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeActive: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: '#10b981' },
  badgeOverdue: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: '#ef4444' },
  badgePartial: { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderWidth: 1, borderColor: '#f59e0b' },
  badgeInfo: { backgroundColor: 'rgba(99, 102, 241, 0.15)', borderWidth: 1, borderColor: '#6366f1' },
  badgeCore: { backgroundColor: 'rgba(2, 132, 199, 0.2)', borderWidth: 1, borderColor: '#0284c7' },
  badgeNew: { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderWidth: 1, borderColor: '#10b981' },
  badgeSoon: { backgroundColor: 'rgba(113, 113, 122, 0.2)', borderWidth: 1, borderColor: '#71717a' },
  badgeNeutral: { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderWidth: 1, borderColor: '#2a2a35' },
  textActive: { color: '#10b981' },
  textOverdue: { color: '#ef4444' },
  textPartial: { color: '#f59e0b' },
  textCore: { color: '#38bdf8' },
  textNew: { color: '#10b981' },
  textSoon: { color: '#a1a1aa' },
  textNeutral: { color: '#ffffff' },
});
