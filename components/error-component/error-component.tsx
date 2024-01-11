import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';
import { Pressable } from 'react-native';
import { Text } from 'react-native-paper';

export default function ErrorComponent({ error }: { error: FetchBaseQueryError | SerializedError }) {
  return (
    <Pressable
      testID="errorComponentId"
      style={({ pressed }) => [
        { opacity: pressed ? 0.5 : 1 },
        { display: 'flex', justifyContent: 'center', alignItems: 'center' },
      ]}>
      <Text variant="bodyMedium">An error occured</Text>
      <Text variant="bodyMedium">
        {'data' in error ? `${(error.data as { message: string }).message}, ${error.status} code` : null}
        {'message' in error ? error.message : null}
        {'error' in error ? error.error : null}
      </Text>
    </Pressable>
  );
}
