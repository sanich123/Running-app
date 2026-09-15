import { AvatarEditableTestIds } from '@Routes/profile/profile-settings/avatar-editable/const';
import UserAvatar from '@S/avatar/avatar';

export default function ProfileAvatar({
  name,
  surname,
  profilePhoto,
}: {
  name?: string;
  surname?: string;
  profilePhoto?: string | null;
}) {
  return (
    <UserAvatar
      size={150}
      profilePhoto={profilePhoto}
      name={name}
      surname={surname}
      testID={profilePhoto ? AvatarEditableTestIds.successImg : AvatarEditableTestIds.default}
    />
  );
}
