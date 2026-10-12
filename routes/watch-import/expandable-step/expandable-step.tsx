import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Icon, Text, useTheme } from 'react-native-paper';
import type { ExpandableStepProps } from './types';

export default function ExpandableStep({ children, number, title }: ExpandableStepProps) {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card style={styles.stepCard}>
      <Card.Content>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={title}
          accessibilityState={{ expanded: isExpanded }}
          onPress={() => setIsExpanded((expanded) => !expanded)}
          style={styles.stepHeading}>
          <View style={[styles.stepNumber, { backgroundColor: colors.primaryContainer }]}>
            <Text variant="titleMedium" style={{ color: colors.primary }}>
              {number}
            </Text>
          </View>
          <Text variant="titleMedium" style={styles.stepTitle}>
            {title}
          </Text>
          <Icon source={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color={colors.onSurfaceVariant} />
        </Pressable>
        {isExpanded && <View style={styles.stepContent}>{children}</View>}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  stepCard: {
    marginTop: 2,
  },
  stepHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  stepNumber: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  stepTitle: {
    flex: 1,
  },
  stepContent: {
    marginTop: 8,
  },
});
