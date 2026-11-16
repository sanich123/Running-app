import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { getErrorMessageFromError } from '@S/error-toast/error-toast';
import { ERROR_COMPONENT_COPY, ERROR_COMPONENT_TEST_ID } from './const';
import type { ErrorComponentProps } from './types';

export default function ErrorComponent({ error, refetch }: ErrorComponentProps) {
  const { language } = useAppSelector(({ settings }) => settings);

  return (
    <View testID={ERROR_COMPONENT_TEST_ID} style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text variant="bodyMedium" style={{ marginTop: 8, textAlign: 'center' }}>
        {getErrorMessageFromError(error)}
      </Text>
      {refetch && (
        <Button mode="contained" style={{ marginTop: 16 }} onPress={() => refetch()}>
          {ERROR_COMPONENT_COPY[language].retry}
        </Button>
      )}
    </View>
  );
}
