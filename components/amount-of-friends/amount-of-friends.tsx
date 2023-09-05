import { Pressable } from 'react-native';
import { Text } from 'react-native-paper';

export default function AmountOfFriends({ amountOfFriends }: { amountOfFriends: number }) {
  return (
    <Pressable>
      <Text variant="bodyLarge">{`Friends ${amountOfFriends}`}</Text>
    </Pressable>
  );
}
