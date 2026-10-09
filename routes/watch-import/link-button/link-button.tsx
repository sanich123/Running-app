import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import type { LinkButtonProps } from './types';

export default function LinkButton({ label, onOpen, standalone = false, url }: LinkButtonProps) {
  return (
    <Button
      mode="contained-tonal"
      onPress={() => void onOpen(url)}
      style={[styles.actionButton, standalone && styles.cardButton]}
      contentStyle={styles.actionButtonContent}>
      {label}
    </Button>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    borderRadius: 12,
    width: '100%',
  },
  cardButton: {
    marginTop: 14,
  },
  actionButtonContent: {
    minHeight: 44,
    paddingHorizontal: 12,
  },
});
