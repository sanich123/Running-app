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
