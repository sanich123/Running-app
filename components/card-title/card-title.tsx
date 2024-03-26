import { memo } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default memo(function CardTitle({ title }: { title: string }) {
  return (
    <View
      style={{
        marginBottom: 5,
        marginTop: 5,
      }}>
      <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
        {title}
      </Text>
    </View>
  );
});
