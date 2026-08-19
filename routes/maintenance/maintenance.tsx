import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';

export default function MaintenancePage() {
  const { colors } = useTheme();
  const { replace } = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="bodyMedium">Технические работы на сервере.</Text>
      <Text variant="bodyMedium">Приносим свои извинения за перебои в работе!</Text>
      <Text variant="bodyMedium">Обычно это длится не более 10 минут</Text>
      <Button
        mode="outlined"
        onPress={() => replace(ROUTES.root)}
        style={[styles.button, { backgroundColor: colors.primary }]}>
        <Text variant="bodyMedium" style={{ color: colors.onPrimary }}>
          Перейти на главную
        </Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    marginTop: 15,
  },
});
