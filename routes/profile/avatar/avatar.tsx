import { useAppSelector } from '@R/typed-hooks';
import { AvatarEditableTestIds } from '@Routes/profile/profile-settings/avatar-editable/const';
import UserAvatar from '@S/avatar/avatar';

export default function ProfileAvatar({ name, surname }: { name?: string; surname?: string }) {
  const { settings } = useAppSelector(({ profile }) => profile);
  return (
    <UserAvatar
      size={150}
      profilePhoto={settings.profilePhoto}
      name={name}
      surname={surname}
      testID={settings.profilePhoto ? AvatarEditableTestIds.successImg : AvatarEditableTestIds.default}
    />
  );
}
