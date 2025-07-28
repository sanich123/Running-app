import { CustomImage } from '@C/custom-image/custom-image';
import { saveWholeProfile } from '@R/slices/profile/profile';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';
import { AvatarShowableIcons, AvatarShowableTestIds } from './const';

export default function AvatarShowable({ size, id }: { size: number; id: string }) {
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector(({ auth }) => auth);
  const isMineAvatar = id === userId;
  const { data: profile, isSuccess, isError } = useGetUserProfileByUserIdQuery(id, { skip: !id });

  useEffect(() => {
    if (profile && isMineAvatar) {
      dispatch(saveWholeProfile(profile));
    }
  }, [dispatch, isMineAvatar, profile]);

  return (
    <>
      {isSuccess ? (
        <>
          {profile?.profilePhoto ? (
            <CustomImage
              style={{ width: size, height: size, borderRadius: 70 }}
              source={{ uri: profile?.profilePhoto }}
              contentFit="cover"
              testID={AvatarShowableTestIds.success}
              placeholder={profile?.profilePhotoBlurhash}
            />
          ) : (
            <Avatar.Icon
              testID={AvatarShowableTestIds.default}
              size={size}
              icon={AvatarShowableIcons.default}
              style={styles.placeInCenter}
            />
          )}
        </>
      ) : null}

      {isError && (
        <Avatar.Icon
          testID={AvatarShowableTestIds.error}
          size={size}
          icon={AvatarShowableIcons.error}
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
