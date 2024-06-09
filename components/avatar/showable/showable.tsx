import { useAuth } from '@A/context/auth-context';
import { CustomImage } from '@C/custom-image/custom-image';
import { saveWholeProfile } from '@R/profile/profile';
import { ProfileSettings } from '@R/profile/types';
import {
  useGetUserProfileByIdQuery,
  useSendProfileInfoMutation,
  useUpdateProfileInfoMutation,
} from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { showCrossPlatformToast } from '@U/custom-toast';
import { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';

import { AVATAR_SHOWABLE, AvatarShowableIcons, AvatarShowableTestIds } from './const';

export default function AvatarShowable({ size, id }: { size: number; id: string }) {
  const toast = useToast();
  const { language } = useAppSelector(({ language }) => language);
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { googleInfo } = useAppSelector(({ profile }) => profile);
  const isMineAvatar = id === user?.id;
  const { data: profile, error, isSuccess } = useGetUserProfileByIdQuery(id, { skip: !id });
  const [sendProfile] = useSendProfileInfoMutation();
  const [updateProfile] = useUpdateProfileInfoMutation();

  useEffect(() => {
    if (isMineAvatar && isSuccess && !profile) {
      if (googleInfo.photo) {
        if (user?.id) {
          sendingGooglePhotoToSupabase(
            {
              gender: '',
              name: googleInfo?.name ? googleInfo.name : '',
              surname: '',
              city: '',
              weight: '',
              bio: '',
              profilePhoto: googleInfo?.photo ? googleInfo.photo : '',
              email: googleInfo?.email ? googleInfo.email : '',
            },
            user?.id,
          );
        }
      }
    }
    if (isMineAvatar && isSuccess && !profile?.email) {
      if (googleInfo?.email) {
        updateProfile({ body: { email: googleInfo?.email }, id: profile?.id }).unwrap();
      }
    }
  }, [isSuccess, isMineAvatar]);

  useEffect(() => {
    if (profile && isMineAvatar) {
      dispatch(saveWholeProfile(profile));
    }
  }, [profile]);

  async function sendingGooglePhotoToSupabase(body: ProfileSettings, id: string) {
    return await sendProfile({ body, id })
      .then(() => {
        if (Platform.OS === 'web') {
          toast.show(AVATAR_SHOWABLE[language].successPhotoRenewing);
        } else {
          showCrossPlatformToast(AVATAR_SHOWABLE[language].successPhotoRenewing);
        }
      })
      .catch(() => {
        if (Platform.OS === 'web') {
          toast.show(AVATAR_SHOWABLE[language].failurePhotoRenewing);
        } else {
          showCrossPlatformToast(AVATAR_SHOWABLE[language].failurePhotoRenewing);
        }
      });
  }

  return (
    <>
      {isMineAvatar && !error && !profile && googleInfo.photo && (
        <CustomImage
          style={{ width: size, height: size, borderRadius: 70 }}
          source={{ uri: googleInfo.photo }}
          contentFit="cover"
          testID={AvatarShowableTestIds.success}
        />
      )}
      {!error && profile && profile?.profilePhoto && (
        <CustomImage
          style={{ width: size, height: size, borderRadius: 70 }}
          source={{ uri: profile?.profilePhoto }}
          contentFit="cover"
          testID={AvatarShowableTestIds.success}
          placeholder={profile?.profilePhotoBlurhash}
        />
      )}
      {(error || profile?.message) && (
        <Avatar.Icon
          testID={AvatarShowableTestIds.error}
          size={size}
          icon={AvatarShowableIcons.error}
          style={styles.placeInCenter}
        />
      )}
      {!error && !profile && !googleInfo.photo && (
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
