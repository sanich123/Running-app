import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Avatar, useTheme } from 'react-native-paper';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { saveWholeProfile } from '@R/slices/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { CustomImage } from '@Routes/custom-image/custom-image';
import { AvatarShowableIcons, AvatarShowableTestIds } from './const';

export default function AvatarShowable({ size, id, focused }: { size: number; id: string; focused?: boolean }) {
  const { colors } = useTheme();
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
              style={[
                { width: size, height: size, borderRadius: 70 },
                { borderWidth: 1, borderColor: focused ? colors.primary : 'transparent' },
              ]}
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
