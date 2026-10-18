import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { MAINTENANCE_TEXT } from '../const';

export default function MaintenancePage() {
  const { colors } = useTheme();
  const { replace } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = MAINTENANCE_TEXT[language];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="bodyMedium">{copy.title}</Text>
      <Text variant="bodyMedium">{copy.apology}</Text>
      <Text variant="bodyMedium">{copy.duration}</Text>
      <Button
        mode="outlined"
        onPress={() => replace(ROUTES.root)}
        style={[styles.button, { backgroundColor: colors.primary }]}>
        <Text variant="bodyMedium" style={{ color: colors.onPrimary }}>
          {copy.home}
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
