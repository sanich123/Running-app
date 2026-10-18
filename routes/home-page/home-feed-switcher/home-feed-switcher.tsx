import { useMemo } from 'react';
import { TabBar } from 'react-native-tab-view';
import { Animated, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { HOME_FEED_COPY } from '../const';
import { FEEDS } from './const';
import type { HomeFeedSwitcherProps } from './types';

export default function HomeFeedSwitcher({ value, onValueChange }: HomeFeedSwitcherProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { colors, fonts } = useTheme();
  const selectedIndex = FEEDS.indexOf(value);
  const labels = HOME_FEED_COPY[language];
  const routes = FEEDS.map((feed) => ({ key: feed, title: labels[feed] }));
  const options = Object.fromEntries(FEEDS.map((feed) => [feed, { labelStyle: fonts.labelLarge }]));
  const tabPosition = useMemo(
    () =>
      new Animated.Value(selectedIndex).interpolate({
        inputRange: FEEDS.map((_, index) => index),
        outputRange: FEEDS.map((_, index) => index),
      }),
    [selectedIndex],
  );

  return (
    <TabBar
      testID="home-feed-switcher"
      navigationState={{ index: selectedIndex, routes }}
      layout={{ width: 0, height: 0 }}
      position={tabPosition}
      jumpTo={(key) => onValueChange(key as (typeof FEEDS)[number])}
      activeColor={colors.onPrimary}
      inactiveColor={colors.onSecondaryContainer}
      options={options}
      pressColor="transparent"
      pressOpacity={0.78}
      tabStyle={styles.option}
      indicatorStyle={[styles.selectedSurface, { backgroundColor: colors.primary }]}
      style={[styles.track, { backgroundColor: colors.secondaryContainer }]}
    />
  );
}

const styles = StyleSheet.create({
  track: {
    alignSelf: 'center',
    width: '100%',
    marginBottom: 4,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 0,
    shadowOpacity: 0,
  },
  option: {
    minHeight: 40,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 12,
  },
  selectedSurface: {
    height: '100%',
    borderRadius: 12,
    opacity: 0.86,
  },
});
