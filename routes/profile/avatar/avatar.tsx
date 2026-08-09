import { StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { AvatarEditableTestIds } from '@Routes/profile/profile-settings/avatar-editable/const';
import { AvatarShowableIcons } from '@S/avatar/showable/const';
import { CustomImage } from '@S/custom-image/custom-image';

export default function ProfileAvatar() {
  const { settings } = useAppSelector(({ profile }) => profile);
  return (
    <>
      {settings?.profilePhoto ? (
        <CustomImage
          testID={AvatarEditableTestIds.successImg}
          source={{ uri: settings?.profilePhoto }}
          style={styles.imgStyles}
        />
      ) : (
        <Avatar.Icon
          testID={AvatarEditableTestIds.default}
          size={150}
          icon={AvatarShowableIcons.default}
          style={styles.isInCenter}
        />
      )}
    </>
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
