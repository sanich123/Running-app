import { View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

export default function ChangePasswordPage() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 15 }}>
      <TextInput label="Введите новый пароль" />
      <Button mode="outlined">Поменять пароль</Button>
    </View>
  );
}
