import { useCallback } from 'react';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { View, StyleSheet } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import { MAP_SPORT_TO_TITLE } from '@U/icon-utils';
import { SPORTS_NAMES } from './const';
import type { ChooseSportModalProps } from './types';

export default function ChooseSportModal({
  chooseSportModalRef,
  isDisabled = false,
  selectedSport,
  onSportChange,
}: ChooseSportModalProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const sport = selectedSport;
  const sportLabels = {
    walk: language === LANGUAGES.russian ? 'Ходьба' : 'Walking',
    run: language === LANGUAGES.russian ? 'Бег' : 'Running',
    bike: language === LANGUAGES.russian ? 'Велосипед' : 'Cycling',
    hike: language === LANGUAGES.russian ? 'Поход' : 'Hiking',
  } as const;
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    [],
  );
  return (
    <BottomSheetModal
      ref={chooseSportModalRef}
      index={0}
      snapPoints={['42%']}
      backdropComponent={renderBackdrop}
      handleStyle={[styles.handle, { backgroundColor: colors.surface }]}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.outline }}>
      <BottomSheetView style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <View>
            <Text variant="titleLarge" style={[styles.title, isDisabled && { color: colors.onSurfaceDisabled }]}>
              {language === LANGUAGES.russian ? 'Выберите спорт' : 'Choose a sport'}
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: isDisabled ? colors.onSurfaceDisabled : colors.onSurfaceVariant }}>
              {language === LANGUAGES.russian ? 'Выберите вариант для активности' : 'Choose an activity type'}
            </Text>
          </View>
        </View>

        <View style={styles.options}>
          {SPORTS_NAMES.map(({ iconName, value }) => {
            const isSelected = sport === value;
            return (
              <TouchableRipple
                testID={`activity-sport-${value}`}
                key={iconName}
                borderless
                disabled={isDisabled}
                style={[
                  styles.option,
                  {
                    backgroundColor: isDisabled
                      ? colors.surfaceDisabled
                      : isSelected
                        ? colors.primaryContainer
                        : colors.surfaceVariant,
                    borderColor: isDisabled ? colors.outline : isSelected ? colors.primary : colors.outlineVariant,
                  },
                ]}
                onPress={() => {
                  onSportChange(value);
                  chooseSportModalRef.current?.close();
                }}>
                <View style={styles.optionContent}>
                  <Icon
                    source={iconName}
                    size={26}
                    color={
                      isDisabled ? colors.onSurfaceDisabled : isSelected ? colors.primary : colors.onSurfaceVariant
                    }
                  />
                  <Text
                    variant="labelMedium"
                    style={[
                      styles.optionLabel,
                      {
                        color: isDisabled
                          ? colors.onSurfaceDisabled
                          : isSelected
                            ? colors.onPrimaryContainer
                            : colors.onSurface,
                      },
                    ]}>
                    {sportLabels[value as keyof typeof sportLabels] ?? MAP_SPORT_TO_TITLE[value][language]}
                  </Text>
                </View>
              </TouchableRipple>
            );
          })}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  handle: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  sheet: { flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },
  header: { paddingBottom: 18, paddingTop: 4 },
  title: { fontWeight: '800' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { borderRadius: 14, borderWidth: 1, flexBasis: '48%', flexGrow: 1, minHeight: 70, overflow: 'hidden' },
  optionContent: { alignItems: 'center', flexDirection: 'column', gap: 5, justifyContent: 'center', padding: 8 },
  optionLabel: { fontWeight: '700' },
});
