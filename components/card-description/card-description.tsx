import { memo } from 'react';
import { Text } from 'react-native-paper';

export default memo(function CardDesription({ description }: { description: string }) {
  return <Text variant="bodyLarge">{description}</Text>;
});
