import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { getErrorMessageFromError } from '@S/error-toast/error-toast';
import { ERROR_COMPONENT_TEST_ID, ERROR_COMPONENT_TEXT } from './const';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export default function ErrorComponent({
  error,
  refetch,
}: {
  error: FetchBaseQueryError | SerializedError;
  refetch?: () => object;
}) {
  return (
    <View testID={ERROR_COMPONENT_TEST_ID} style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text variant="titleMedium">{ERROR_COMPONENT_TEXT.title}</Text>
      <Text variant="bodySmall" style={{ marginTop: 4, opacity: 0.65 }}>
        {ERROR_COMPONENT_TEXT.subtitle}
      </Text>
      <Text variant="bodyMedium" style={{ marginTop: 8, textAlign: 'center' }}>
        {getErrorMessageFromError(error)}
      </Text>
      {refetch && (
        <Button mode="contained" style={{ marginTop: 16 }} onPress={() => refetch()}>
          {ERROR_COMPONENT_TEXT.retry}
        </Button>
      )}
    </View>
  );
}
