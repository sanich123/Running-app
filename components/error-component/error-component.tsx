import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';
import { View } from 'react-native';

import { Text } from '../Themed';

export default function ErrorComponent({ error }: { error: FetchBaseQueryError | SerializedError }) {
  return (
    <View>
      <Text>
        {'data' in error ? error.status : null} {'message' in error ? error.message : null}
      </Text>
    </View>
  );
}
