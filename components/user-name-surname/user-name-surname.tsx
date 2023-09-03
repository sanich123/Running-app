import { ActivityIndicator, Text } from 'react-native-paper';

import { useGetUserProfileByIdQuery } from '../../redux/runnich-api/runnich-api';
import ErrorComponent from '../error-component/error-component';

export default function UserNameSurname({ userId }: { userId: string }) {
  const { isLoading, error, data: profileInfo } = useGetUserProfileByIdQuery(userId);
  return (
    <>
      {isLoading && <ActivityIndicator />}
      {error ? <ErrorComponent error={error} /> : null}
      {profileInfo && (
        <>
          <Text variant="bodyLarge">{profileInfo?.name}</Text>
          <Text variant="bodyLarge">{profileInfo?.surname}</Text>
        </>
      )}
    </>
  );
}
