import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  Icon,
  IconButton,
  Menu,
  Searchbar,
  SegmentedButtons,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { getIconNameByTypeOfSport } from '@U/icon-utils';
import { GROUPS_COPY, GROUP_SPORTS, getGroupSportLabels } from '../../const';
import type { GroupsFilterControlsProps } from './types';

export default function GroupsFilterControls({ filters, onChange }: GroupsFilterControlsProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { language } = useAppSelector(({ settings }) => settings);
  const { allGroups, myGroups, allActivities, search: searchCopy, closeSearch } = GROUPS_COPY[language];
  const sportLabels = getGroupSportLabels(language);
  const [isSportMenuVisible, setIsSportMenuVisible] = useState(false);
  const { scope, search, sport } = filters;

  return (
    <View style={styles.controls}>
      <SegmentedButtons
        value={scope}
        onValueChange={(scope) => {
          if (scope !== 'all' && scope !== 'mine') return;
          onChange({ ...filters, scope });
        }}
        buttons={[
          { value: 'all', label: allGroups, style: styles.scopeButton },
          { value: 'mine', label: myGroups, style: styles.scopeButton },
        ]}
      />
      <View style={styles.filterRow} testID="groups-filter-row">
        <Menu
          visible={isSportMenuVisible}
          onDismiss={() => setIsSportMenuVisible(false)}
          elevation={3}
          contentStyle={[
            styles.sportMenu,
            { backgroundColor: colors.surface, width: Math.min(Math.max(width - 32, 220), 360) },
          ]}
          anchor={
            <TouchableRipple
              accessibilityLabel={sport ? sportLabels[sport] : allActivities}
              accessibilityRole="button"
              onPress={() => setIsSportMenuVisible(true)}
              rippleColor={colors.primaryContainer}
              style={[styles.sportFilter, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
              testID="groups-sport-filter">
              <View style={styles.sportFilterContent}>
                <Text variant="labelLarge" numberOfLines={1} style={{ color: colors.primary }}>
                  {sport ? sportLabels[sport] : allActivities}
                </Text>
                <Icon source="chevron-down" size={18} color={colors.onSurfaceVariant} />
              </View>
            </TouchableRipple>
          }>
          <Menu.Item
            title={allActivities}
            trailingIcon={sport === null ? 'check' : undefined}
            contentStyle={styles.sportOptionContent}
            style={styles.sportOption}
            testID="groups-sport-filter-all"
            onPress={() => {
              onChange({ ...filters, sport: null });
              setIsSportMenuVisible(false);
            }}
          />
          {GROUP_SPORTS.map((activitySport) => (
            <Menu.Item
              key={activitySport}
              title={sportLabels[activitySport]}
              leadingIcon={getIconNameByTypeOfSport(activitySport)}
              trailingIcon={sport === activitySport ? 'check' : undefined}
              contentStyle={styles.sportOptionContent}
              style={styles.sportOption}
              testID={`groups-sport-filter-${activitySport}`}
              onPress={() => {
                onChange({ ...filters, sport: activitySport });
                setIsSportMenuVisible(false);
              }}
            />
          ))}
        </Menu>
        <Searchbar
          iconColor={colors.primary}
          mode="bar"
          placeholder={searchCopy}
          searchAccessibilityLabel={searchCopy}
          accessibilityLabel={searchCopy}
          value={search}
          onChangeText={(search) => onChange({ ...filters, search })}
          right={() => (
            <IconButton
              icon="close"
              accessibilityLabel={closeSearch}
              onPress={() => onChange({ ...filters, search: '' })}
              style={styles.searchClear}
              testID="clear-groups-search"
            />
          )}
          style={[styles.filterSearch, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
          inputStyle={styles.filterSearchInput}
          testID="search-groups"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  filterRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  scopeButton: { overflow: 'hidden' },
  filterSearch: {
    borderRadius: 24,
    borderWidth: 1,
    elevation: 0,
    flex: 1,
    height: 48,
    margin: 0,
    minHeight: 48,
    overflow: 'hidden',
    width: '100%',
  },
  filterSearchInput: { fontSize: 14, lineHeight: 18, minHeight: 40, paddingVertical: 0 },
  searchClear: { height: 40, margin: 0, width: 40 },
  sportFilter: { alignSelf: 'flex-start', borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  sportOptionContent: { flex: 1 },
  sportOption: { width: '100%' },
  sportFilterContent: {
    alignItems: 'center',
    borderRadius: 24,
    flexDirection: 'row',
    gap: 4,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  sportMenu: { borderRadius: 16, minWidth: 176, paddingVertical: 4 },
});
