import { Image } from 'react-native';
import { ActivityIndicator, Avatar, MD2Colors } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAuth } from '../../auth/context/auth-context';
import { useGetUserProfileByIdQuery } from '../../redux/runnich-api/runnich-api';
import ErrorComponent from '../error-component/error-component';

export default function AvatarShowable({ size, id }: { size: number; id: string }) {
  const { user } = useAuth();
  const { isLoading, data: profile, error } = useGetUserProfileByIdQuery(user?.id);

  return (
    <>
      {isLoading && <ActivityIndicator animating color={MD2Colors.red800} />}
      {error ? <ErrorComponent error={error} /> : null}
      {!isLoading && profile?.profilePhoto && (
        <Image
          source={{ uri: profile?.profilePhoto }}
          style={{ width: size, height: size, borderRadius: 70 }}
          resizeMode="cover"
        />
      )}
      {!profile && !isLoading && (
        <Avatar.Image
          size={size}
          source={() => <Icon name="person" size={size} />}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      )}
    </>
  );
}
