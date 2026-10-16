import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { useAppSelector } from '@R/typed-hooks';
import { ERROR_COMPONENT_TEST_ID } from '@S/error-component/const';
import { getErrorMessageFromError } from '@S/error-toast/error-toast';
import { HOME_FEED_ERROR_COPY } from './const';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

interface HomeFeedErrorProps {
  error: FetchBaseQueryError | SerializedError;
  refetch: () => unknown;
}

export default function HomeFeedError({ error, refetch }: HomeFeedErrorProps) {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = HOME_FEED_ERROR_COPY[language];
  const isNetworkError = 'status' in error && error.status === 'FETCH_ERROR';

  return (
    <View style={styles.slot}>
      <View
        testID={ERROR_COMPONENT_TEST_ID}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <View style={[styles.iconContainer, { backgroundColor: colors.errorContainer }]}>
          <Icon source={isNetworkError ? 'wifi-off' : 'cloud-alert-outline'} size={28} color={colors.error} />
        </View>
        <Text variant="titleMedium" style={[styles.title, { color: colors.onSurface }]}>
          {copy.title}
        </Text>
        <Text variant="bodyMedium" style={[styles.message, { color: colors.onSurfaceVariant }]}>
          {getErrorMessageFromError(error)}
        </Text>
        <Button mode="contained" style={styles.retry} onPress={() => void refetch()}>
          {copy.retry}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    alignSelf: 'stretch',
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 300,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  card: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: MAX_MOBILE_WIDTH,
    paddingHorizontal: 24,
    paddingVertical: 28,
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginBottom: 16,
    width: 56,
  },
  title: { fontWeight: '700', textAlign: 'center' },
  message: { marginTop: 8, textAlign: 'center' },
  retry: { marginTop: 20 },
});
