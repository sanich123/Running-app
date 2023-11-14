import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';
import { Pressable } from 'react-native';
import { Text } from 'react-native-paper';

export default function ErrorComponent({
  error,
  refetchFn,
}: {
  error: FetchBaseQueryError | SerializedError;
  refetchFn: () => void;
}) {
  return (
    <Pressable
      testID="errorComponentId"
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      onPress={() => refetchFn()}>
      <Text variant="bodyMedium">An error occured</Text>
      <Text variant="bodyMedium">
        {'data' in error ? `${(error.data as { message: string }).message}, ${error.status} code` : null}
        {'message' in error ? error.message : null}
        {'error' in error ? error.error : null}
      </Text>
      <Text>Refresh manually</Text>
    </Pressable>
  );
}
