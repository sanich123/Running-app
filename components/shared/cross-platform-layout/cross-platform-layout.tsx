import { PropsWithChildren, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CrossPlatformLayoutProps } from './types';
import NetworkStateBanner from '../network-state-banner/network-state-banner';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

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
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: colors.background }, (isError || isLoading) && styles.centered]}
      edges={edges}>
      {scrollViewEnabled ? (
        <KeyboardAwareScrollView>
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
            <>
              {!isLoading && <NetworkStateBanner />}
              {children}
            </>
          </ScrollView>
        </KeyboardAwareScrollView>
      ) : (
        <>
          {!isLoading && <NetworkStateBanner />}
          {children}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
