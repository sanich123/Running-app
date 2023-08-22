import { Pressable } from 'react-native';

import { View, Text } from '../Themed';

export default function Button({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <View>
      <Pressable onPress={onPress}>
        <Text>{label}</Text>
      </Pressable>
    </View>
  );
}
