import { StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { GENDER_BTNS, GENDER_BTNS_TEST_IDS, GENDER_BTNS_VALUES } from './const';
import { useProfileFormParams, useSetProfileFormParams } from '../profile-settings-params';

export default function GenderBtns({ isDisabled }: { isDisabled: boolean }) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { gender } = useProfileFormParams();
  const { setGender } = useSetProfileFormParams();
  const { colors, dark } = useTheme();
  const options = [
    {
      value: GENDER_BTNS_VALUES.male,
      label: GENDER_BTNS[language].maleLabel,
      icon: 'human-male',
      testID: GENDER_BTNS_TEST_IDS.male,
    },
    {
      value: GENDER_BTNS_VALUES.female,
      label: GENDER_BTNS[language].femaleLabel,
      icon: 'human-female',
      testID: GENDER_BTNS_TEST_IDS.female,
    },
  ] as const;

  return (
    <View style={styles.options}>
      {options.map(({ value, label, icon, testID }) => {
        const isSelected = gender === value;
        return (
          <TouchableRipple
            key={value}
            testID={testID}
            disabled={isDisabled}
            onPress={() => setGender(value)}
            borderless
            rippleColor={dark ? 'rgba(255, 255, 255, .08)' : 'rgba(0, 0, 0, .08)'}
            accessibilityRole="radio"
            accessibilityState={{ disabled: isDisabled, selected: isSelected }}
            style={[
              styles.option,
              {
                backgroundColor: isSelected ? colors.primaryContainer : colors.surface,
                borderColor: isSelected ? colors.primary : colors.outlineVariant,
              },
              isDisabled && styles.disabled,
            ]}>
            <View style={styles.optionContent}>
              <Icon source={icon} size={24} color={isSelected ? colors.primary : colors.onSurfaceVariant} />
              <Text variant="labelLarge" style={{ color: isSelected ? colors.onPrimaryContainer : colors.onSurface }}>
                {label}
              </Text>
              <Icon
                source={isSelected ? 'check-circle' : 'circle-outline'}
                size={22}
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
  options: { flexDirection: 'row', gap: 8, width: '100%' },
  option: { borderRadius: 14, borderWidth: 1, flex: 1, minHeight: 56, overflow: 'hidden' },
  optionContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  disabled: { opacity: 0.5 },
});
