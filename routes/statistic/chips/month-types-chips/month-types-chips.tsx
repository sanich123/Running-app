import { FlatList, Platform, useWindowDimensions, StyleSheet } from 'react-native';
import { Card, Chip, Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { MAP_SPORT_TO_TITLE } from '@U/icon-utils';
import type { MonthChips } from '../types';
import type { SPORTS_BTNS_VALUES } from '@const/sports';

export default function MonthTypesChips({ typesOfSport, setSelectedType, selectedType }: MonthChips) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const isRussian = language === LANGUAGES.russian;
  return (
    <Card
      mode="contained"
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.outlineVariant,
          width: width < MAX_MOBILE_WIDTH ? (Platform.OS === 'web' ? '100%' : 'auto') : MAX_MOBILE_WIDTH,
          marginHorizontal: Platform.OS === 'web' ? 'auto' : 10,
        },
      ]}>
      <Card.Content style={styles.content}>
        <Text variant="labelLarge" style={[styles.label, { color: colors.onSurfaceVariant }]}>
          {isRussian ? 'Вид спорта' : 'Sport'}
        </Text>
        <FlatList
          data={typesOfSport}
          keyExtractor={(type) => type}
          renderItem={({ item: type, index }) => (
            <Chip
              compact
              mode="outlined"
              key={type}
              style={[styles.chip, { marginLeft: index ? 8 : 0, borderColor: colors.outlineVariant }]}
              onPress={() => setSelectedType(type)}
              selected={type === selectedType}
              showSelectedOverlay
              selectedColor={colors.onPrimaryContainer}
              textStyle={styles.chipText}>
              {isRussian && `${type}` in MAP_SPORT_TO_TITLE
                ? MAP_SPORT_TO_TITLE[type as SPORTS_BTNS_VALUES][language]
                : type}
            </Chip>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={3}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, marginVertical: 8 },
  content: { paddingHorizontal: 14, paddingVertical: 14 },
  label: { fontWeight: '700', marginBottom: 8 },
  chip: { borderRadius: 10 },
  chipText: { fontSize: 13, fontWeight: '700' },
});
