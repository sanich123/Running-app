import { Image } from 'react-native';
import { Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

import { useGetUserProfileByIdQuery } from '../../redux/runich-api/runich-api';
import ErrorComponent from '../error-component/error-component';

export default function AvatarShowable({ size, id }: { size: number; id: string }) {
  const { isLoading, data: profile, error } = useGetUserProfileByIdQuery(id);

  return (
    <>
      {error ? <ErrorComponent error={error} /> : null}
      {!isLoading && profile?.profilePhoto && (
        <Image
          testID="avatarShowableImage"
          source={{ uri: profile?.profilePhoto }}
          style={{ width: size, height: size, borderRadius: 70 }}
          resizeMode="cover"
        />
      )}
      {!profile && !isLoading && (
        <Avatar.Image
          testID="avatarShowableDefaultIcon"
          size={size}
          source={() => <Icon name="person" size={size} />}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      )}
      {isLoading && (
        <Avatar.Icon
          testID="avatarShowableLoadingIcon"
          size={size}
          icon="arrow-down-thin-circle-outline"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      )}
    </>
  );
}
