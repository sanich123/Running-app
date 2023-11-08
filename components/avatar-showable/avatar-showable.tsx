import { Image, View } from 'react-native';
import { ActivityIndicator, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

import { useGetUserProfileByIdQuery } from '../../redux/runich-api/runich-api';

export default function AvatarShowable({ size, id }: { size: number; id: string }) {
  const { isLoading, data: profile, error } = useGetUserProfileByIdQuery(id);

  return (
    <>
      {isLoading && (
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
          <ActivityIndicator size="small" testID="avatarShowableLoadingIcon" />
        </View>
      )}
      {profile && profile?.profilePhoto && (
        <Image
          testID="avatarShowableImage"
          source={{ uri: profile?.profilePhoto }}
          style={{ width: size, height: size, borderRadius: 70 }}
          resizeMode="cover"
        />
      )}
      {error && (
        <Avatar.Icon
          testID="avatarShowableErrorIcon"
          size={size}
          icon="web-cancel"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      )}

      {!isLoading && !profile && (
        <Avatar.Image
          testID="avatarShowableDefaultIcon"
          size={size}
          source={() => <Icon name="person" size={size} />}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      )}
    </>
  );
}
