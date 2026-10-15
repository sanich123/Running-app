import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { HOME_FEED } from './const';
import type { HomeFeed } from './const';

interface HomeFeedSwitcherProps {
  value: HomeFeed;
  labels: Record<HomeFeed, string>;
  onValueChange: (value: HomeFeed) => void;
}

const FEEDS: HomeFeed[] = [HOME_FEED.my, HOME_FEED.followers, HOME_FEED.favorites];

export default function HomeFeedSwitcher({ value, labels, onValueChange }: HomeFeedSwitcherProps) {
  const { colors } = useTheme();
  const selectedIndex = FEEDS.indexOf(value);
  const [segmentWidth, setSegmentWidth] = useState(0);
  const [indicatorOffset] = useState(() => new Animated.Value(0));
  const didMeasure = useRef(false);

  useEffect(() => {
    if (segmentWidth === 0) return;

    const animation = Animated.spring(indicatorOffset, {
      toValue: selectedIndex * segmentWidth,
      damping: 22,
      stiffness: 180,
      mass: 1,
      useNativeDriver: true,
    });
    animation.start();

    return () => animation.stop();
  }, [indicatorOffset, segmentWidth, selectedIndex]);

  return (
    <View
      testID="home-feed-switcher"
      style={[styles.track, { backgroundColor: colors.secondaryContainer }]}
      onLayout={({ nativeEvent }) => {
        const nextSegmentWidth = nativeEvent.layout.width / FEEDS.length;
        setSegmentWidth(nextSegmentWidth);
        if (!didMeasure.current) {
          indicatorOffset.setValue(selectedIndex * nextSegmentWidth);
          didMeasure.current = true;
        }
      }}>
      {segmentWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.selectedSurface,
            {
              width: segmentWidth,
              backgroundColor: colors.primary,
              transform: [{ translateX: indicatorOffset }],
            },
          ]}
        />
      ) : null}
      {FEEDS.map((feed) => {
        const isSelected = feed === value;

        return (
          <Pressable
            key={feed}
            accessibilityRole="button"
            accessibilityLabel={labels[feed]}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onValueChange(feed)}
            style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
            <Text
              variant="labelLarge"
              numberOfLines={1}
              style={{ color: isSelected ? colors.onPrimary : colors.onSecondaryContainer }}>
              {labels[feed]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    alignSelf: 'center',
    width: '100%',
    marginTop: 0,
    marginBottom: 4,
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
  option: {
    flex: 1,
    minHeight: 34,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSurface: {
    position: 'absolute',
    opacity: 0.86,
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 12,
  },
  pressed: { opacity: 0.78 },
});
