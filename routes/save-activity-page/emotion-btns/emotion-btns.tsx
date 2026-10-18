import { Platform, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import NativeSegmentedControl from '@S/segmented-control';
import { useManualActivityParams, useSetManualActivityParams } from '../manual-activity-params';
import { EMOTIONS_BTNS_VALUES, EMOTION_BTNS, EMOTIONS_BTNS_TEST_IDS } from './const';

export default function EmotionBtns() {
  const { isSavingDisabled } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ settings }) => settings);
  const { emotion } = useManualActivityParams();
  const { setEmotion } = useSetManualActivityParams();
  const { colors } = useTheme();
  const options = [
    {
      value: EMOTIONS_BTNS_VALUES.good,
      label: EMOTION_BTNS[language].fineLabel,
      testID: EMOTIONS_BTNS_TEST_IDS.goodInput,
    },
    {
      value: EMOTIONS_BTNS_VALUES.normal,
      label: EMOTION_BTNS[language].normalLabel,
      testID: EMOTIONS_BTNS_TEST_IDS.normalInput,
    },
    {
      value: EMOTIONS_BTNS_VALUES.fucked,
      label: EMOTION_BTNS[language].fuckedLabel,
      testID: EMOTIONS_BTNS_TEST_IDS.fuckedInput,
    },
  ] as const;
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text variant="labelMedium" style={{ color: colors.onSurface }}>
          {EMOTION_BTNS[language].sectionLabel}
        </Text>
      </View>
      <NativeSegmentedControl
        testID="activity-emotion"
        testIDS={options.map(({ testID }) => testID)}
        values={options.map(({ label }) => label)}
        selectedIndex={options.findIndex(({ value }) => value === emotion)}
        onChange={({ nativeEvent: { selectedSegmentIndex } }) => {
          const selectedEmotion = options[selectedSegmentIndex]?.value;
          if (selectedEmotion) setEmotion(selectedEmotion);
        }}
        enabled={!isSavingDisabled}
        tintColor={colors.primary}
        backgroundColor={colors.secondaryContainer}
        fontStyle={{ color: colors.onSecondaryContainer, fontSize: 10 }}
        activeFontStyle={{ color: colors.onPrimary, fontSize: 10, fontWeight: '600' }}
        {...(Platform.OS === 'android' || Platform.OS === 'web' ? { sliderStyle: styles.slider } : {})}
        style={styles.options}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 0,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  copy: { flex: 1, gap: 2, minWidth: 0 },
  options: { borderRadius: 12, flexShrink: 0, height: 40, overflow: 'hidden', width: 216 },
  slider: { borderColor: 'transparent', borderWidth: 0, elevation: 0, shadowOpacity: 0 },
});
