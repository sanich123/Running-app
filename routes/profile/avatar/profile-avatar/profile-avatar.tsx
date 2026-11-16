import UserAvatar from '@S/avatar/user-avatar/user-avatar';
import { ProfileAvatarTestIds } from './const';
import type { ProfileAvatarProps } from './types';

export default function ProfileAvatar({ name, surname, profilePhoto, profilePhotoBlurhash }: ProfileAvatarProps) {
  return (
    <UserAvatar
      size={150}
      profilePhoto={profilePhoto}
      placeholder={profilePhotoBlurhash}
      name={name}
      surname={surname}
      testID={profilePhoto ? ProfileAvatarTestIds.image : ProfileAvatarTestIds.defaultIcon}
    />
  );
}
