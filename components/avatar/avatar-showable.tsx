import { Image } from 'react-native';
import { ActivityIndicator, Avatar, MD2Colors } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

import useGetProfileInfo from '../../utils/hooks/use-get-profile';
import ErrorComponent from '../error-component/error-component';

export default function AvatarShowable({ size, id }: { size: number; id: string }) {
  const { isLoading, profileInfo: profileInfoPhoto, profileError } = useGetProfileInfo('profile_photo');
  console.log(profileInfoPhoto);
  return (
    <>
      {isLoading && <ActivityIndicator animating color={MD2Colors.red800} />}
      {profileError ? <ErrorComponent error={profileError} /> : null}
      {!isLoading && profileInfoPhoto[0] && (
        <Image
          source={{ uri: profileInfoPhoto[0]?.profile_photo }}
          style={{ width: size, height: size, borderRadius: 70 }}
          resizeMode="cover"
        />
      )}
      {!profileInfoPhoto && !isLoading && (
        <Avatar.Image
          size={size}
          source={() => <Icon name="person" size={size} />}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      )}
    </>
  );
}
