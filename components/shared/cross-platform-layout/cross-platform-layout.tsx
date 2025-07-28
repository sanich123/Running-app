import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PropsWithChildren, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CrossPlatformLayoutProps } from './types';
import NetworkStateBanner from '../network-state-banner/network-state-banner';

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

  return (
    <BottomSheetModalProvider>
      {scrollViewEnabled ? (
        <SafeAreaView
          style={[{ flex: 1, backgroundColor: 'red' }, (isError || isLoading) && styles.centered]}
          edges={edges}>
          {!isLoading && <NetworkStateBanner />}
          <ScrollView
            contentContainerStyle={[
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
            {children}
          </ScrollView>
        </SafeAreaView>
      ) : (
        <SafeAreaView
          style={[
            { flex: 1, ...outerStyles, backgroundColor: colors.background },
            (isError || isLoading) && styles.centered,
            Platform.OS === 'web' && {
              maxWidth: 600,
              marginLeft: 'auto',
              marginRight: 'auto',
              height: '100%',
              width: '100%',
            },
          ]}
          edges={edges}>
          {!isLoading && <NetworkStateBanner />}
          {children}
        </SafeAreaView>
      )}
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
