import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { getErrorMessageFromError } from '@C/shared/error-toast/error-toast';
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
    <View testID="errorComponentId" style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text variant="titleMedium">Не удалось загрузить данные</Text>
      <Text variant="bodySmall" style={{ marginTop: 4, opacity: 0.65 }}>
        An error occured
      </Text>
      <Text variant="bodyMedium" style={{ marginTop: 8, textAlign: 'center' }}>
        {getErrorMessageFromError(error)}
      </Text>
      {refetch && (
        <Button mode="contained" style={{ marginTop: 16 }} onPress={() => refetch()}>
          Повторить
        </Button>
      )}
    </View>
  );
}
