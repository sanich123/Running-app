import { Image, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar } from 'react-native-paper';

import { AvatarShowableIcons, AvatarShowableTestIds } from './const';
import { useGetUserProfileByIdQuery } from '../../redux/runich-api/runich-api';

export default function AvatarShowable({ size, id }: { size: number; id: string }) {
  const { isLoading, data: profile, error } = useGetUserProfileByIdQuery(id);

  return (
    <>
      {isLoading && (
        <View style={[styles.placeInCenter && { width: size, height: size }]}>
          <ActivityIndicator size="small" testID={AvatarShowableTestIds.isLoading} />
        </View>
      )}
      {!error && profile && profile?.profilePhoto && (
        <Image
          testID={AvatarShowableTestIds.success}
          source={{ uri: profile?.profilePhoto }}
          style={{ width: size, height: size, borderRadius: 70 }}
          resizeMode="cover"
        />
      )}
      {error && (
        <Avatar.Icon
          testID={AvatarShowableTestIds.error}
          size={size}
          icon={AvatarShowableIcons.error}
          style={styles.placeInCenter}
        />
      )}
      {!error && !isLoading && !profile && (
        <Avatar.Icon
          testID={AvatarShowableTestIds.default}
          size={size}
          icon={AvatarShowableIcons.default}
          style={styles.placeInCenter}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  placeInCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
