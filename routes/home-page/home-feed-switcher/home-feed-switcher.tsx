import { Platform, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import NativeSegmentedControl from '@S/segmented-control';
import { HOME_FEED_COPY } from '../const';
import { FEEDS } from './const';
import type { HomeFeedSwitcherProps } from './types';

export default function HomeFeedSwitcher({ value, onValueChange }: HomeFeedSwitcherProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors } = useTheme();
  const labels = HOME_FEED_COPY[language];

  return (
    <NativeSegmentedControl
      testID="home-feed-switcher"
      values={FEEDS.map((feed) => labels[feed])}
      selectedIndex={FEEDS.indexOf(value)}
      onChange={({ nativeEvent: { selectedSegmentIndex } }) => {
        const selectedFeed = FEEDS[selectedSegmentIndex];
        if (selectedFeed) onValueChange(selectedFeed);
      }}
      tintColor={colors.primary}
      backgroundColor={colors.secondaryContainer}
      fontStyle={{ color: colors.onSecondaryContainer, fontSize: 14 }}
      activeFontStyle={{ color: colors.onPrimary, fontSize: 14, fontWeight: '600' }}
      {...(Platform.OS === 'android' || Platform.OS === 'web' ? { sliderStyle: styles.slider } : {})}
      style={styles.control}
    />
  );
}

const styles = StyleSheet.create({
  control: { alignSelf: 'center', borderRadius: 12, height: 40, marginBottom: 4, overflow: 'hidden', width: '100%' },
  slider: { borderColor: 'transparent', borderWidth: 0, elevation: 0, shadowOpacity: 0 },
});
