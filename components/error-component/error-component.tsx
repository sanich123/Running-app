import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';
import { View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

export default function ErrorComponent({
  error,
  refetch,
}: {
  error: FetchBaseQueryError | SerializedError;
  refetch?: () => object;
}) {
  const { dark } = useTheme();
  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      borderless
      testID="errorComponentId"
      onPress={() => refetch?.()}>
      <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Text variant="bodyMedium">An error occured</Text>
        <Text variant="bodyMedium">
          {'data' in error ? `${(error.data as { message: string }).message}, ${error.status} code` : null}
          {'message' in error ? error.message : null}
          {'error' in error ? error.error : null}
        </Text>
      </View>
    </TouchableRipple>
  );
}
