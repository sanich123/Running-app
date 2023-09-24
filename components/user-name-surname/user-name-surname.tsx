import { ActivityIndicator, MD3TypescaleKey, Text } from 'react-native-paper';
import { VariantProp } from 'react-native-paper/lib/typescript/components/Typography/types';

import { useAuth } from '../../auth/context/auth-context';
import { useGetUserProfileByIdQuery } from '../../redux/runnich-api/runnich-api';
import ErrorComponent from '../error-component/error-component';

export default function UserNameSurname({ size }: { size: VariantProp<MD3TypescaleKey> }) {
  const { user } = useAuth();
  const { isLoading, error, data: profileInfo } = useGetUserProfileByIdQuery(user.id);
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
