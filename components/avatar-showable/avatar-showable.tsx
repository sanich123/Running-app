import { useGetUserProfileByIdQuery } from '@R/runich-api/runich-api';
import { memo } from 'react';
import { Image, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Avatar } from 'react-native-paper';

import { AvatarShowableIcons, AvatarShowableTestIds } from './const';

export default memo(
  function AvatarShowable({ size, id }: { size: number; id: string }) {
    const { data: profile, error } = useGetUserProfileByIdQuery(id);
    return (
      <>
        {!error && profile && profile?.profilePhoto && (
          <FastImage
            testID={AvatarShowableTestIds.success}
            source={{ uri: profile?.profilePhoto, priority: FastImage.priority.high }}
            style={{ width: size, height: size, borderRadius: 70 }}
            resizeMode={FastImage.resizeMode.cover}
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
  },
  (prev, next) => prev.id === next.id,
);

const styles = StyleSheet.create({
  placeInCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
