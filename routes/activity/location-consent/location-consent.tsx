import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Checkbox, Text, useTheme } from 'react-native-paper';
import { LANGUAGES, ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';

export default function LocationConsent({
  accepted,
  onChange,
  disabled = false,
  onDetailsPress,
}: {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
  disabled?: boolean;
  onDetailsPress?: () => void;
}) {
  const { colors } = useTheme();
  const { push } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const isRussian = language === LANGUAGES.russian;

  return (
    <View style={styles.row}>
      <Checkbox
        testID="location-consent-checkbox"
        status={accepted ? 'checked' : 'unchecked'}
        onPress={() => onChange(!accepted)}
        disabled={disabled}
        color={colors.primary}
      />
      <Text variant="bodySmall" style={[styles.label, { color: colors.onSurface }]}>
        {isRussian
          ? 'Даю согласие на обработку данных геолокации для записи тренировок. '
          : 'I give separate consent to process location data for workout recording. '}
        <Text
          accessibilityRole="link"
          onPress={() => {
            onDetailsPress?.();
            push(
              `/${isRussian ? ROUTES.locationConsent : ROUTES.locationConsentEnglish}` as Parameters<typeof push>[0],
            );
          }}
          style={{ color: colors.primary }}>
          {isRussian ? 'Подробнее' : 'Read the consent'}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 4,
    marginTop: 12,
  },
  label: {
    flex: 1,
    lineHeight: 19,
    paddingTop: 8,
  },
});
