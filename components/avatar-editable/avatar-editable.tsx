import { useAuth } from '@A/context/auth-context';
import { AvatarShowableIcons } from '@C/avatar-showable/const';
import { savePhotoUrl } from '@R/profile/profile';
import { useGetUserProfileByIdQuery } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorHandler } from '@U/error-handler';
import { getAccessToGallery, compressAndSendPhoto } from '@U/file-sending';
import { useState } from 'react';
import { Pressable, Image, StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';

import { AvatarIconEditableProps, AvatarEditableTestIds } from './const';

export default function AvatarIconEditable({ isDisabled, setIsDisabled }: AvatarIconEditableProps) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { data: profileInfo } = useGetUserProfileByIdQuery(`${user?.id}`);
  const { isDisabledWhileSendingProfile } = useAppSelector(({ profile }) => profile);
  const [photoUrl, setPhotoUrl] = useState(profileInfo?.profilePhoto);

  return (
    <Pressable
      testID={AvatarEditableTestIds.editBtn}
      onPress={async () => {
        setIsDisabled(true);
        try {
          const result = await getAccessToGallery();
          if (result && !result.canceled) {
            const imgSrc = result.assets[0].uri;
            if (user) {
              const url = await compressAndSendPhoto(imgSrc, user.id);
              if (url) {
                setPhotoUrl(url);
                dispatch(savePhotoUrl(url));
              }
            }
          }
        } catch (error) {
          errorHandler(error);
        } finally {
          setIsDisabled(false);
        }
      }}
      disabled={isDisabled || isDisabledWhileSendingProfile}
      style={(isDisabled || isDisabledWhileSendingProfile) && { opacity: 0.5 }}>
      {!photoUrl ? (
        <Avatar.Icon
          testID={AvatarEditableTestIds.default}
          size={150}
          icon={AvatarShowableIcons.default}
          style={styles.isInCenter}
        />
      ) : (
        <Image testID={AvatarEditableTestIds.successImg} source={{ uri: photoUrl }} style={styles.imgStyles} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  isInCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgStyles: {
    width: 150,
    height: 150,
    borderRadius: 70,
  },
});
