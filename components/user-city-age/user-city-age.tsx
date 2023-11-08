import { MD3TypescaleKey, Text } from 'react-native-paper';
import { VariantProp } from 'react-native-paper/lib/typescript/components/Typography/types';

import { useGetUserProfileByIdQuery } from '../../redux/runich-api/runich-api';
import ErrorComponent from '../error-component/error-component';

export default function UserCityAge({ userId, size }: { userId: string; size: VariantProp<MD3TypescaleKey> }) {
  const { error, data: profileInfo } = useGetUserProfileByIdQuery(userId);
  return (
    <>
      {error ? <ErrorComponent error={error} /> : null}
      {profileInfo ? (
        <>
          <Text variant={size}>{profileInfo?.city}</Text>
        </>
      ) : null}
    </>
  );
}
