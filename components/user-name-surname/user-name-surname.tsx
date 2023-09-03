import { ActivityIndicator, Text } from 'react-native-paper';

import { useGetUserProfileByIdQuery } from '../../redux/runnich-api/runnich-api';

export default function UserNameSurname({ userId }: { userId: string }) {
  const { isLoading, error, data: profileInfo } = useGetUserProfileByIdQuery(userId);
  return (
    <>
      {isLoading && <ActivityIndicator />}
      {error && <Text variant="bodyLarge">An error occured</Text>}
      {profileInfo && (
        <>
          <Text variant="bodyLarge">{profileInfo.name}</Text>
          <Text variant="bodyLarge">{profileInfo.surname}</Text>
        </>
      )}
    </>
  );
}
