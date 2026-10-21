import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform, RefreshControl, View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { getCrossPlatformLayoutEdges } from './const';
import type { CrossPlatformLayoutProps } from './types';

export default function CrossPlatformLayout({
  children,
  isError,
  isLoading,
  refetch,
  outerStyles,
  scrollViewEnabled,
  edges = ['bottom'],
}: PropsWithChildren<CrossPlatformLayoutProps>) {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const isStatusState = Boolean(isError || isLoading);
  const canUseScrollView = Boolean(scrollViewEnabled && (!isStatusState || (refetch && !isLoading)));
  const content = children;
  // The Android root stack applies the navigation-bar inset to each screen's content container.
  const safeAreaEdges = getCrossPlatformLayoutEdges(edges, Platform.OS);

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: colors.background }, (isError || isLoading) && styles.centered]}
      edges={safeAreaEdges}>
      {canUseScrollView ? (
        <KeyboardAwareScrollView
          testID="cross-platform-scroll-view"
          style={styles.flex}
          bottomOffset={24}
          contentContainerStyle={[
            styles.grow,
            Platform.OS === 'web' && {
              maxWidth: 600,
              marginLeft: 'auto',
              marginRight: 'auto',
              width: '100%',
            },
            (isError || isLoading) && styles.centered,
            { ...outerStyles },
          ]}
          refreshControl={
            refetch && !isLoading ? (
              <RefreshControl
                testID="cross-platform-refresh-control"
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  refetch?.();
                  setTimeout(() => {
                    setRefreshing(false);
                  }, 2000);
                }}
              />
            ) : undefined
          }>
          {content}
        </KeyboardAwareScrollView>
      ) : (
        <View style={[styles.flex, isStatusState && styles.centered, outerStyles]}>{content}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: { flex: 1 },
  grow: { flexGrow: 1 },
});
