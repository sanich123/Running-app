import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Icon, Menu, RadioButton, Text, TouchableRipple, useTheme } from 'react-native-paper';
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
  const { width, height } = useWindowDimensions();
  const { language } = useAppSelector(({ settings }) => settings);
  const {
    tooManyCategories,
    sports: sportsCopy,
    categories,
    chooseCategories,
    privacy: privacyCopy,
    open,
    closed,
    openDescription,
    closedDescription,
  } = GROUPS_COPY[language];
  const sportLabels = getGroupSportLabels(language);
  const categoryLabels = GROUP_CATEGORY_LABELS[language === LANGUAGES.english ? 'en' : 'ru'];
  const { sports, categoryTags, privacy: selectedPrivacy } = options;
  const selectedSport = sports[0] ?? GROUP_SPORTS[0];
  const [isSportMenuVisible, setIsSportMenuVisible] = useState(false);
  const [isCategoryMenuVisible, setIsCategoryMenuVisible] = useState(false);
  const dropdownWidth = Math.min(Math.max(width - 32, 220), 688);
  const categoryMenuHeight = Math.min(360, Math.max(height - 220, 180));

  const toggleSport = (sport: GroupSport) => {
    if (sports[0] === sport) return;
    onChange({
      ...options,
      sports: [sport],
    });
  };

  const toggleCategory = (categoryTag: GroupCategoryTag) => {
    if (categoryTags.includes(categoryTag)) {
      onChange({ ...options, categoryTags: categoryTags.filter((selectedTag) => selectedTag !== categoryTag) });
      return;
    }
    if (categoryTags.length === 3) {
      return errorToast(tooManyCategories);
    }
    onChange({ ...options, categoryTags: [...categoryTags, categoryTag] });
  };

  return (
    <View style={styles.section}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        {sportsCopy}
      </Text>
      <Menu
        visible={isSportMenuVisible}
        onDismiss={() => setIsSportMenuVisible(false)}
        elevation={3}
        contentStyle={[styles.dropdownMenu, { backgroundColor: colors.surface, width: dropdownWidth }]}
        anchor={
          <TouchableRipple
            accessibilityLabel={sportLabels[selectedSport]}
            accessibilityRole="button"
            onPress={() => setIsSportMenuVisible(true)}
            rippleColor={colors.primaryContainer}
            style={[styles.dropdown, { backgroundColor: colors.surfaceVariant, borderColor: colors.outlineVariant }]}
            testID="group-sport-selector">
            <View style={styles.dropdownContent}>
              <Icon source={getIconNameByTypeOfSport(selectedSport)} size={20} color={colors.primary} />
              <Text variant="bodyLarge" numberOfLines={1} style={styles.dropdownLabel}>
                {sportLabels[selectedSport]}
              </Text>
              <Icon source="chevron-down" size={20} color={colors.onSurfaceVariant} />
            </View>
          </TouchableRipple>
        }>
        {GROUP_SPORTS.map((sport) => (
          <Menu.Item
            key={sport}
            title={sportLabels[sport]}
            leadingIcon={getIconNameByTypeOfSport(sport)}
            trailingIcon={selectedSport === sport ? 'check' : undefined}
            testID={`group-sport-option-${sport}`}
            onPress={() => {
              toggleSport(sport);
              setIsSportMenuVisible(false);
            }}
          />
        ))}
      </Menu>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        {categories}
      </Text>
      <Menu
        visible={isCategoryMenuVisible}
        onDismiss={() => setIsCategoryMenuVisible(false)}
        elevation={3}
        contentStyle={[styles.dropdownMenu, { backgroundColor: colors.surface, width: dropdownWidth }]}
        anchor={
          <TouchableRipple
            accessibilityLabel={
              categoryTags.length ? categoryTags.map((tag) => categoryLabels[tag]).join(', ') : chooseCategories
            }
            accessibilityRole="button"
            onPress={() => setIsCategoryMenuVisible(true)}
            rippleColor={colors.primaryContainer}
            style={[styles.dropdown, { backgroundColor: colors.surfaceVariant, borderColor: colors.outlineVariant }]}
            testID="group-category-selector">
            <View style={styles.dropdownContent}>
              <Text
                variant="bodyLarge"
                numberOfLines={1}
                style={[
                  styles.dropdownLabel,
                  { color: categoryTags.length ? colors.onSurface : colors.onSurfaceVariant },
                ]}>
                {categoryTags.length ? categoryTags.map((tag) => categoryLabels[tag]).join(' · ') : chooseCategories}
              </Text>
              <Icon source="chevron-down" size={20} color={colors.onSurfaceVariant} />
            </View>
          </TouchableRipple>
        }>
        <ScrollView style={{ height: categoryMenuHeight }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {GROUP_CATEGORY_TAGS.map((categoryTag) => (
            <Menu.Item
              key={categoryTag}
              title={categoryLabels[categoryTag]}
              leadingIcon={categoryTags.includes(categoryTag) ? 'checkbox-marked' : 'checkbox-blank-outline'}
              testID={`group-category-option-${categoryTag}`}
              onPress={() => toggleCategory(categoryTag)}
            />
          ))}
        </ScrollView>
      </Menu>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        {privacyCopy}
      </Text>
      <View accessibilityRole="radiogroup" style={styles.privacyOptions}>
        {(['open', 'closed'] as const).map((privacy) => {
          const isSelected = selectedPrivacy === privacy;
          return (
            <Pressable
              key={privacy}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              testID={`group-privacy-${privacy}`}
              onPress={() => onChange({ ...options, privacy })}
              style={[
                styles.privacyOption,
                {
                  backgroundColor: isSelected ? colors.primaryContainer : colors.surfaceVariant,
                  borderColor: isSelected ? colors.primary : colors.outlineVariant,
                },
              ]}>
              <RadioButton
                value={privacy}
                status={isSelected ? 'checked' : 'unchecked'}
                onPress={() => onChange({ ...options, privacy })}
                color={colors.primary}
                uncheckedColor={colors.onSurfaceVariant}
              />
              <View style={styles.privacyText}>
                <Text variant="titleSmall" style={{ color: colors.onSurface, fontWeight: '700' }}>
                  {privacy === 'open' ? open : closed}
                </Text>
                <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                  {privacy === 'open' ? openDescription : closedDescription}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  sectionTitle: { fontWeight: '700', marginTop: 8 },
  dropdown: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', width: '100%' },
  dropdownContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  dropdownLabel: { color: 'white', flex: 1 },
  dropdownMenu: { borderRadius: 14, maxHeight: 360, paddingVertical: 4 },
  privacyOptions: { gap: 8 },
  privacyOption: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  privacyText: { flex: 1, gap: 2 },
});
