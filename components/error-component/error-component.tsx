import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function ErrorComponent({ error }: { error: FetchBaseQueryError | SerializedError }) {
  return (
    <View>
      <Text variant="bodyMedium">
        {'data' in error ? `${(error.data as { message: string }).message}, ${error.status} code` : null}
        {'message' in error ? error.message : null}
      </Text>
    </View>
  );
}
