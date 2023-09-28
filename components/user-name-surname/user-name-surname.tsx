import { ActivityIndicator, MD3TypescaleKey, Text } from 'react-native-paper';
import { VariantProp } from 'react-native-paper/lib/typescript/components/Typography/types';

import { useGetUserProfileByIdQuery } from '../../redux/runnich-api/runnich-api';
import ErrorComponent from '../error-component/error-component';

export default function UserNameSurname({ userId, size }: { userId: string; size: VariantProp<MD3TypescaleKey> }) {
  const { isLoading, error, data: profileInfo } = useGetUserProfileByIdQuery(userId);
  return (
    <>
      {isLoading && <ActivityIndicator />}
      {error ? <ErrorComponent error={error} /> : null}
      {profileInfo ? (
        <Text variant={size} style={{ fontWeight: 'bold' }}>
          {profileInfo?.name} {profileInfo?.surname}
        </Text>
      ) : null}
    </>
  );
}
