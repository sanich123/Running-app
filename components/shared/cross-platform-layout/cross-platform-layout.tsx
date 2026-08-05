import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
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
  const content = children;

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: colors.background }, (isError || isLoading) && styles.centered]}
      edges={edges}>
      {scrollViewEnabled && !isStatusState ? (
        <KeyboardAwareScrollView style={styles.flex}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.grow,
              Platform.OS === 'web' && {
                maxWidth: 600,
                marginLeft: 'auto',
                marginRight: 'auto',
                height: '100%',
                width: '100%',
              },
              (isError || isLoading) && styles.centered,
              { ...outerStyles },
            ]}
            refreshControl={
              refetch && (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    refetch?.();
                    setTimeout(() => {
                      setRefreshing(false);
                    }, 2000);
                  }}
                />
              )
            }>
            {content}
          </ScrollView>
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
