import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, RadioButton, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { getIconNameByTypeOfSport } from '@U/icon-utils';
import {
  GROUP_CATEGORY_LABELS,
  GROUP_CATEGORY_TAGS,
  GROUPS_COPY,
  GROUP_SPORTS,
  getGroupSportLabels,
} from '../../const';
import type { GroupCreationOptions } from '../types';
import type { GroupCategoryTag, GroupSport } from '@R/services/groups/types';

export default function GroupOptionsFields({
  options,
  onChange,
}: {
  options: GroupCreationOptions;
  onChange: (options: GroupCreationOptions) => void;
}) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = GROUPS_COPY[language];
  const sportLabels = getGroupSportLabels(language);
  const categoryLabels = GROUP_CATEGORY_LABELS[language === LANGUAGES.english ? 'en' : 'ru'];

  const toggleSport = (sport: GroupSport) => {
    onChange({
      ...options,
      sports: options.sports.includes(sport)
        ? options.sports.filter((selectedSport) => selectedSport !== sport)
        : [...options.sports, sport],
    });
  };

  const toggleCategory = (categoryTag: GroupCategoryTag) => {
    if (options.categoryTags.includes(categoryTag)) {
      onChange({ ...options, categoryTags: options.categoryTags.filter((selectedTag) => selectedTag !== categoryTag) });
      return;
    }
    if (options.categoryTags.length === 3) {
      errorToast(copy.tooManyCategories);
      return;
    }
    onChange({ ...options, categoryTags: [...options.categoryTags, categoryTag] });
  };

  return (
    <View style={styles.section}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {copy.sports}
      </Text>
      <View style={styles.chips}>
        {GROUP_SPORTS.map((sport) => (
          <Pressable
            key={sport}
            accessibilityRole="button"
            accessibilityLabel={sportLabels[sport]}
            accessibilityState={{ selected: options.sports.includes(sport) }}
            testID={`group-sport-option-${sport}`}
            onPress={() => toggleSport(sport)}
            style={[
              styles.sportOption,
              { backgroundColor: options.sports.includes(sport) ? colors.primaryContainer : colors.surfaceVariant },
            ]}>
            <Icon
              source={getIconNameByTypeOfSport(sport)}
              size={18}
              color={options.sports.includes(sport) ? colors.primary : colors.onSurfaceVariant}
            />
            <Text
              variant="bodyMedium"
              style={{ color: options.sports.includes(sport) ? colors.primary : colors.onSurfaceVariant }}>
              {sportLabels[sport]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        {copy.categories}
      </Text>
      <View style={styles.chips}>
        {GROUP_CATEGORY_TAGS.map((categoryTag) => (
          <Pressable
            key={categoryTag}
            accessibilityRole="button"
            accessibilityState={{ selected: options.categoryTags.includes(categoryTag) }}
            testID={`group-category-option-${categoryTag}`}
            onPress={() => toggleCategory(categoryTag)}
            style={[
              styles.categoryOption,
              {
                backgroundColor: options.categoryTags.includes(categoryTag)
                  ? colors.primaryContainer
                  : colors.surfaceVariant,
              },
            ]}>
            <Text
              variant="bodyMedium"
              style={{ color: options.categoryTags.includes(categoryTag) ? colors.primary : colors.onSurfaceVariant }}>
              {categoryLabels[categoryTag]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        {copy.privacy}
      </Text>
      <RadioButton.Group
        value={options.privacy}
        onValueChange={(privacy) => onChange({ ...options, privacy: privacy as GroupCreationOptions['privacy'] })}>
        <RadioButton.Item
          value="open"
          label={`${copy.open}\n${copy.openDescription}`}
          position="leading"
          style={styles.privacyOption}
        />
        <RadioButton.Item
          value="closed"
          label={`${copy.closed}\n${copy.closedDescription}`}
          position="leading"
          style={styles.privacyOption}
        />
      </RadioButton.Group>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  sectionTitle: { fontWeight: '700', marginTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sportOption: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  categoryOption: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 9 },
  privacyOption: { paddingHorizontal: 0 },
});
