import { StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { useManualActivityParams, useSetManualActivityParams } from '../manual-activity-params';
import { EMOTIONS_BTNS_VALUES, EMOTION_BTNS, EMOTIONS_BTNS_ICONS, EMOTIONS_BTNS_TEST_IDS } from './const';

export default function EmotionBtns({ isDisabled }: { isDisabled: boolean }) {
  const { isSavingDisabled } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ settings }) => settings);
  const { emotion } = useManualActivityParams();
  const { setEmotion } = useSetManualActivityParams();
  const { colors, dark } = useTheme();
  const disabled = isDisabled || isSavingDisabled;
  const options = [
    {
      value: EMOTIONS_BTNS_VALUES.good,
      label: EMOTION_BTNS[language].fineLabel,
      icon: EMOTIONS_BTNS_ICONS.iconHappy,
      testID: EMOTIONS_BTNS_TEST_IDS.goodInput,
    },
    {
      value: EMOTIONS_BTNS_VALUES.normal,
      label: EMOTION_BTNS[language].normalLabel,
      icon: EMOTIONS_BTNS_ICONS.iconNeutral,
      testID: EMOTIONS_BTNS_TEST_IDS.normalInput,
    },
    {
      value: EMOTIONS_BTNS_VALUES.fucked,
      label: EMOTION_BTNS[language].fuckedLabel,
      icon: EMOTIONS_BTNS_ICONS.iconFucked,
      testID: EMOTIONS_BTNS_TEST_IDS.fuckedInput,
    },
  ] as const;

  return (
    <View style={styles.container}>
      <Text variant="labelMedium" style={[styles.caption, { color: colors.onSurfaceVariant }]}>
        {EMOTION_BTNS[language].sectionLabel}
      </Text>
      <View style={styles.options}>
        {options.map(({ value, label, icon, testID }) => {
          const isSelected = emotion === value;
          return (
            <TouchableRipple
              key={value}
              testID={testID}
              disabled={disabled}
              borderless
              onPress={() => setEmotion(value)}
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
                <Icon source={icon} size={28} color={isSelected ? colors.primary : colors.onSurfaceVariant} />
                <Text variant="labelLarge" style={{ color: isSelected ? colors.onPrimaryContainer : colors.onSurface }}>
                  {label}
                </Text>
              </View>
            </TouchableRipple>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6, marginTop: 12 },
  caption: { marginLeft: 4 },
  options: { flexDirection: 'row', gap: 8 },
  option: { borderRadius: 14, borderWidth: 1, flex: 1, minHeight: 78, overflow: 'hidden' },
  optionContent: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 10,
  },
  disabled: { opacity: 0.5 },
});
