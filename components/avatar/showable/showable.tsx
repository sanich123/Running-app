import { useAuth } from '@A/context/auth-context';
import { CustomImage } from '@C/custom-image/custom-image';
import { saveWholeProfile } from '@R/profile/profile';
import {
  useGetUserProfileByUserIdQuery,
  useCreateProfileByUserIdMutation,
  useUpdateProfileByProfileIdMutation,
} from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';

import { AvatarShowableIcons, AvatarShowableTestIds } from './const';

export default function AvatarShowable({ size, id }: { size: number; id: string }) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { googleInfo } = useAppSelector(({ profile }) => profile);
  const isMineAvatar = id === user?.id;
  const { data: profile, isSuccess, isError } = useGetUserProfileByUserIdQuery(id, { skip: !id });
  const [createProfile] = useCreateProfileByUserIdMutation();
  const [updateProfile] = useUpdateProfileByProfileIdMutation();

  useEffect(() => {
    async function createProfileWithGoogleInfo() {
      return await createProfile({
        body: {
          name: `${googleInfo?.givenName}` || '',
          surname: `${googleInfo.familyName}` || '',
          profilePhoto: `${googleInfo.photo}` || '',
          email: googleInfo.email,
          city: '',
          bio: '',
          gender: '',
          sport: '',
          weight: '',
        },
        id: `${user?.id}`,
      });
    }
    async function updateProfileWithGoogleInfo() {
      return await updateProfile({
        body: {
          name: profile?.name || googleInfo?.givenName,
          surname: profile?.surname || googleInfo?.familyName,
          profilePhoto: profile?.profilePhoto || googleInfo?.photo,
          email: profile?.email || googleInfo?.email,
        },
        id: profile?.id,
      });
    }
    if (!profile && isSuccess && isMineAvatar) {
      createProfileWithGoogleInfo();
    } else if (profile) {
      if (
        (!profile?.profilePhoto && googleInfo?.photo) ||
        (!profile?.name && googleInfo?.givenName) ||
        (!profile?.surname && googleInfo?.familyName) ||
        (!profile?.email && googleInfo?.email)
      ) {
        updateProfileWithGoogleInfo();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile && isMineAvatar) {
      dispatch(saveWholeProfile(profile));
    }
  }, [dispatch, isMineAvatar, profile]);

  return (
    <>
      {isSuccess ? (
        <>
          {profile?.profilePhoto?.length > 0 || googleInfo?.photo ? (
            <CustomImage
              style={{ width: size, height: size, borderRadius: 70 }}
              source={{ uri: profile?.profilePhoto || googleInfo?.photo }}
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

      {(isError || profile?.message) && (
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
