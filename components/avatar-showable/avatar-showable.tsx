import { useGetUserProfileByIdQuery } from '@R/runich-api/runich-api';
import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';

import { AvatarShowableIcons, AvatarShowableTestIds } from './const';

export default memo(function AvatarShowable({ size, id }: { size: number; id: string }) {
  const { data: profile, error } = useGetUserProfileByIdQuery(id);
  return (
    <>
      {!error && profile && profile?.profilePhoto && (
        <Image style={{ width: size, height: size, borderRadius: 70 }} source={{ uri: profile?.profilePhoto }} />
      )}
      {error && (
        <Avatar.Icon
          testID={AvatarShowableTestIds.error}
          size={size}
          icon={AvatarShowableIcons.error}
          style={styles.placeInCenter}
        />
      )}
      {!error && !profile && (
        <Avatar.Icon
          testID={AvatarShowableTestIds.default}
          size={size}
          icon={AvatarShowableIcons.default}
          style={styles.placeInCenter}
        />
      )}
    </>
  );
});

const styles = StyleSheet.create({
  placeInCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
