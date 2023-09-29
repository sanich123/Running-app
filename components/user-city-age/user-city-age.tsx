import { ActivityIndicator, MD3TypescaleKey, Text } from 'react-native-paper';
import { VariantProp } from 'react-native-paper/lib/typescript/components/Typography/types';

import { useGetUserProfileByIdQuery } from '../../redux/runich-api/runich-api';
import { calculateAge } from '../../utils/time-formatter';
import ErrorComponent from '../error-component/error-component';

export default function UserCityAge({ userId, size }: { userId: string; size: VariantProp<MD3TypescaleKey> }) {
  const { isLoading, error, data: profileInfo } = useGetUserProfileByIdQuery(userId);
  return (
    <>
      {isLoading && <ActivityIndicator />}
      {error ? <ErrorComponent error={error} /> : null}
      {profileInfo ? (
        <>
          <Text variant={size}>
            {profileInfo?.city || 'Default city'},{' '}
            {profileInfo?.birthday ? `${calculateAge(new Date(profileInfo?.birthday))} years old` : 'Your age'}
          </Text>
        </>
      ) : null}
    </>
  );
}
