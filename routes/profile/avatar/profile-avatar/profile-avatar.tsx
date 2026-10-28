import UserAvatar from '@S/avatar/user-avatar/user-avatar';
import { ProfileAvatarTestIds } from './const';

export default function ProfileAvatar({
  name,
  surname,
  profilePhoto,
  profilePhotoBlurhash,
}: {
  name?: string;
  surname?: string;
  profilePhoto?: string | null;
  profilePhotoBlurhash?: string | null;
}) {
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
