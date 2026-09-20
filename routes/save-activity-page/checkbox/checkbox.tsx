import { StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { useManualActivityParams, useSetManualActivityParams } from '../manual-activity-params';
import {
  ACTIVITY_VISIBILITY,
  ACTIVITY_VISIBILITY_DESCRIPTIONS,
  ACTIVITY_VISIBILITY_ICONS,
  CHECKBOX,
  CHECKBOX_TEST_ID,
  ACTIVITY_VISIBILITY_SECTION_LABELS,
} from './const';

export default function Checkbox({ isDisabled }: { isDisabled: boolean }) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { isSavingDisabled } = useAppSelector(({ activity }) => activity);
  const { visibility } = useManualActivityParams();
  const { setVisibility } = useSetManualActivityParams();
  const { colors, dark } = useTheme();
  const disabled = isDisabled || isSavingDisabled;
  const options = [ACTIVITY_VISIBILITY.public, ACTIVITY_VISIBILITY.followers, ACTIVITY_VISIBILITY.private] as const;

  return (
    <View style={styles.container}>
      <Text variant="labelMedium" style={[styles.caption, { color: colors.onSurfaceVariant }]}>
        {ACTIVITY_VISIBILITY_SECTION_LABELS[language]}
      </Text>
      {options.map((value) => {
        const isSelected = visibility === value;
        return (
          <TouchableRipple
            key={value}
            testID={value === ACTIVITY_VISIBILITY.public ? CHECKBOX_TEST_ID : `activity-visibility-${value}`}
            disabled={disabled}
            onPress={() => setVisibility(value)}
            rippleColor={dark ? 'rgba(255, 255, 255, .08)' : 'rgba(0, 0, 0, .08)'}
            accessibilityRole="radio"
            accessibilityState={{ disabled, selected: isSelected }}
            style={[
              styles.option,
              {
                backgroundColor: isSelected ? colors.primaryContainer : colors.surface,
                borderColor: isSelected ? colors.primary : colors.outlineVariant,
              },
              disabled && styles.disabled,
            ]}>
            <View style={styles.optionContent}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: isSelected ? colors.primary : colors.surfaceVariant },
                ]}>
                <Icon
                  source={ACTIVITY_VISIBILITY_ICONS[value]}
                  size={22}
                  color={isSelected ? colors.onPrimary : colors.onSurfaceVariant}
                />
              </View>
              <View style={styles.copy}>
                <Text variant="titleSmall" style={{ color: colors.onSurface }}>
                  {CHECKBOX[language][value]}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                  {ACTIVITY_VISIBILITY_DESCRIPTIONS[language][value]}
                </Text>
              </View>
              <Icon
                source={isSelected ? 'check-circle' : 'circle-outline'}
                size={24}
                color={isSelected ? colors.primary : colors.outline}
              />
            </View>
          </TouchableRipple>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, marginTop: 12 },
  caption: { marginLeft: 4 },
  option: { borderRadius: 10, borderWidth: 1, minHeight: 52, overflow: 'hidden' },
  optionContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  iconContainer: { alignItems: 'center', borderRadius: 16, height: 32, justifyContent: 'center', width: 32 },
  copy: { flex: 1 },
  disabled: { opacity: 0.5 },
});
