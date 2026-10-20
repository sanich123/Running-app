import { useState } from 'react';
import { BottomSheet, BottomSheetView } from '@expo/ui/community/bottom-sheet';
import Svg, { Circle, Path } from 'react-native-svg';
import { Platform, StyleSheet, View } from 'react-native';
import { Switch, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import NativeSegmentedControl from '@S/segmented-control';
import { useManualActivityParams, useSetManualActivityParams } from '../manual-activity-params';
import { MAP_VISIBILITY, ROUTE_PREVIEW_PATH } from './const';

export default function MapVisibility() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { hideMap } = useManualActivityParams();
  const { setHideMap } = useSetManualActivityParams();
  const { isSavingDisabled } = useAppSelector(({ activity }) => activity);
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const copy = MAP_VISIBILITY[language];
  const visibilityOptions = [copy.shownSegment, copy.hiddenSegment];

  return (
    <>
      <View style={styles.row}>
        <TouchableRipple onPress={() => setIsSheetOpen(true)} accessible={false} style={StyleSheet.absoluteFill}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableRipple>
        <View pointerEvents="box-none" style={styles.rowContent}>
          <TouchableRipple
            testID="map-visibility-open"
            onPress={() => setIsSheetOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={copy.title}
            style={styles.rowCopy}>
            <Text variant="labelMedium" style={{ color: colors.onSurface }}>
              {copy.title}
            </Text>
          </TouchableRipple>
          <NativeSegmentedControl
            testID="map-visibility-control"
            testIDS={['map-visibility-shown', 'map-visibility-hidden']}
            values={visibilityOptions}
            selectedIndex={hideMap ? 1 : 0}
            onChange={({ nativeEvent: { selectedSegmentIndex } }) => setHideMap(selectedSegmentIndex === 1)}
            enabled={!isSavingDisabled}
            tintColor={colors.primary}
            backgroundColor={colors.secondaryContainer}
            fontStyle={{ color: colors.onSecondaryContainer, fontSize: 10 }}
            activeFontStyle={{ color: colors.onPrimary, fontSize: 10, fontWeight: '600' }}
            {...(Platform.OS === 'android' || Platform.OS === 'web' ? { sliderStyle: styles.slider } : {})}
            style={styles.visibilityControl}
          />
        </View>
      </View>
      {isSheetOpen ? (
        <BottomSheet
          index={0}
          snapPoints={['55%']}
          enablePanDownToClose
          onClose={() => setIsSheetOpen(false)}
          backgroundStyle={{ backgroundColor: colors.elevation.level3 }}
          handleIndicatorStyle={{ backgroundColor: colors.onSurfaceVariant }}>
          <BottomSheetView style={styles.sheet}>
            <View style={styles.switchRow}>
              <Text variant="titleMedium" style={{ color: colors.onSurface }}>
                {copy.hideMap}
              </Text>
              <Switch
                testID="map-visibility-switch"
                value={hideMap}
                onValueChange={setHideMap}
                disabled={isSavingDisabled}
                color={colors.primary}
              />
            </View>
            <View
              testID="map-visibility-preview"
              accessibilityLabel={hideMap ? copy.hidden : copy.shown}
              style={[styles.preview, { backgroundColor: hideMap ? '#171719' : '#263641' }]}>
              <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
                {hideMap ? (
                  <>
                    <Path
                      d="M-20 38 C45 2 93 84 153 49 S253 11 320 48 S388 84 430 42"
                      fill="none"
                      stroke="#2a2a2e"
                      strokeWidth="2"
                    />
                    <Path
                      d="M-24 115 C52 65 97 161 169 120 S278 76 342 122 S393 155 430 112"
                      fill="none"
                      stroke="#2b2b30"
                      strokeWidth="2"
                    />
                    <Path
                      d="M-24 188 C44 142 115 220 186 178 S276 143 350 188 S396 214 430 179"
                      fill="none"
                      stroke="#29292d"
                      strokeWidth="2"
                    />
                  </>
                ) : (
                  <>
                    <Path
                      d="M-15 12 L77 58 L146 37 L229 90 L301 68 L420 119"
                      fill="none"
                      stroke="#63737d"
                      strokeWidth="7"
                    />
                    <Path
                      d="M36 237 L119 151 L184 167 L242 102 L298 118 L395 42"
                      fill="none"
                      stroke="#53646e"
                      strokeWidth="5"
                    />
                    <Path d="M90 -15 L128 57 L111 111 L171 163 L154 239" fill="none" stroke="#45565f" strokeWidth="4" />
                    <Path
                      d="M-8 101 L75 104 L130 73 L220 103 L281 150 L413 147"
                      fill="none"
                      stroke="#3c6b5c"
                      strokeWidth="16"
                      opacity="0.48"
                    />
                  </>
                )}
                <Path
                  d={ROUTE_PREVIEW_PATH}
                  fill="none"
                  stroke="#741d1c"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d={ROUTE_PREVIEW_PATH}
                  fill="none"
                  stroke="#e33b38"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Circle cx="54" cy="177" r="10" fill="#ef3737" stroke="#fff" strokeWidth="4" />
                <Circle cx="359" cy="166" r="10" fill="#f5f5f5" stroke="#5e5e5e" strokeWidth="3" />
              </Svg>
            </View>
          </BottomSheetView>
        </BottomSheet>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 0,
    paddingVertical: 6,
    paddingHorizontal: 4,
    position: 'relative',
  },
  rowContent: { alignItems: 'center', flexDirection: 'row' },
  rowCopy: { flexShrink: 0, width: '33.333%' },
  visibilityControl: { borderRadius: 12, flexShrink: 0, height: 40, overflow: 'hidden', width: '66.667%' },
  slider: { borderColor: 'transparent', borderWidth: 0, elevation: 0, shadowOpacity: 0 },
  sheet: { flex: 1, gap: 12, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 },
  switchRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 52 },
  preview: { borderRadius: 18, height: 230, overflow: 'hidden', width: '100%' },
});
