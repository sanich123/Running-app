import { useAuth } from '@A/context/auth-context';
import { CustomImage } from '@C/custom-image/custom-image';
import { ProfileSettings } from '@R/profile/types';
import { useGetUserProfileByIdQuery, useSendProfileInfoMutation } from '@R/runich-api/runich-api';
import { useAppSelector } from '@R/typed-hooks';
import { ToastDuration, showCrossPlatformToast } from '@U/custom-toast';
import { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';

import { AvatarShowableIcons, AvatarShowableTestIds } from './const';

export default memo(function AvatarShowable({ size, id }: { size: number; id: string }) {
  const { user } = useAuth();
  const { googleInfo } = useAppSelector(({ profile }) => profile);
  const isMineAvatar = id === user?.id;
  const { data: profile, error, isSuccess } = useGetUserProfileByIdQuery(id);
  const [sendProfile] = useSendProfileInfoMutation();

  useEffect(() => {
    if (isSuccess && !profile) {
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
            },
            user?.id,
          );
        }
      }
    }
  }, [profile]);

  async function sendingGooglePhotoToSupabase(body: ProfileSettings, id: string) {
    return await sendProfile({ body, id })
      .then(() => showCrossPlatformToast('Обновили фото профиля', ToastDuration.short))
      .catch(() => showCrossPlatformToast('Не удалось обновить фото профиля', ToastDuration.short));
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
});

const styles = StyleSheet.create({
  placeInCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
