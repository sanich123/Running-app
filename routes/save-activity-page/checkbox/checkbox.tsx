import { Platform, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import NativeSegmentedControl from '@S/segmented-control';
import { useManualActivityParams, useSetManualActivityParams } from '../manual-activity-params';
import { ACTIVITY_VISIBILITY, CHECKBOX, CHECKBOX_TEST_ID, ACTIVITY_VISIBILITY_SECTION_LABELS } from './const';

export default function Checkbox() {
  const { language } = useAppSelector(({ settings }) => settings);
  const { isSavingDisabled } = useAppSelector(({ activity }) => activity);
  const { visibility } = useManualActivityParams();
  const { setVisibility } = useSetManualActivityParams();
  const { colors } = useTheme();
  const options = [ACTIVITY_VISIBILITY.public, ACTIVITY_VISIBILITY.followers, ACTIVITY_VISIBILITY.private] as const;

  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text variant="labelMedium" style={{ color: colors.onSurface }}>
          {ACTIVITY_VISIBILITY_SECTION_LABELS[language]}
        </Text>
      </View>
      <NativeSegmentedControl
        testID={CHECKBOX_TEST_ID}
        testIDS={options.map((value) => `activity-visibility-${value}`)}
        values={options.map((value) => CHECKBOX[language][value])}
        selectedIndex={options.indexOf(visibility)}
        onChange={({ nativeEvent: { selectedSegmentIndex } }) => {
          const selectedVisibility = options[selectedSegmentIndex];
          if (selectedVisibility) setVisibility(selectedVisibility);
        }}
        enabled={!isSavingDisabled}
        tintColor={colors.primary}
        backgroundColor={colors.secondaryContainer}
        fontStyle={{ color: colors.onSecondaryContainer, fontSize: 10 }}
        activeFontStyle={{ color: colors.onPrimary, fontSize: 10, fontWeight: '600' }}
        {...(Platform.OS === 'android' || Platform.OS === 'web' ? { sliderStyle: styles.slider } : {})}
        style={styles.switcher}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flexDirection: 'row', marginTop: 0, paddingHorizontal: 4, paddingVertical: 6 },
  copy: { flexShrink: 0, width: '33.333%' },
  switcher: { borderRadius: 12, flexShrink: 0, height: 40, overflow: 'hidden', width: '66.667%' },
  slider: { borderColor: 'transparent', borderWidth: 0, elevation: 0, shadowOpacity: 0 },
});
