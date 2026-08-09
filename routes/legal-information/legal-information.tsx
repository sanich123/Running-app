import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';

const MOCK_VALUE_STYLE = { backgroundColor: '#FFF59D' } as const;

const details = [
  ['Наименование', 'ООО «РУНИЧ» (моковые данные)'],
  ['Юридический адрес', '123456, г. Москва, ул. Примерная, д. 1 (моковые данные)'],
  ['ОГРН', '0000000000000 (моковые данные)'],
  ['ИНН / КПП', '0000000000 / 000000000 (моковые данные)'],
  ['Электронная почта', 'legal@example.test (моковые данные)'],
  ['Телефон', '+7 (000) 000-00-00 (моковые данные)'],
];

export default function LegalInformationPage() {
  return (
    <CrossPlatformLayout scrollViewEnabled outerStyles={styles.content}>
      <Text variant="headlineSmall" style={styles.title}>
        Юридическая информация
      </Text>
      <Text variant="bodyMedium" style={styles.notice}>
        Информация об операторе приложения. Реквизиты, отмеченные жёлтым цветом, являются моковыми и должны быть
        заменены на фактические данные до публикации приложения.
      </Text>
      <View style={styles.details}>
        {details.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text variant="bodyMedium" style={styles.label}>
              {label}:{' '}
            </Text>
            <Text variant="bodyMedium" style={MOCK_VALUE_STYLE}>
              {value}
            </Text>
          </View>
        ))}
      </View>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Сведения о приложении
      </Text>
      <Text variant="bodyMedium">
        Приложение runich предоставляет пользователям инструменты для записи тренировок, работы с геопозицией, просмотра
        статистики и взаимодействия с другими пользователями.
      </Text>
      <Text variant="bodyMedium" style={styles.sectionText}>
        По вопросам работы приложения, реализации прав субъекта персональных данных и уточнения реквизитов обращайтесь
        по адресу, указанному выше.
      </Text>
    </CrossPlatformLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  notice: {
    marginBottom: 16,
  },
  details: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: '700',
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionText: {
    marginTop: 12,
  },
});
