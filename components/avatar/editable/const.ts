export type AvatarIconEditableProps = {
  isDisabled: boolean;
  setIsDisabled: (arg: boolean) => void;
};

export const enum AvatarEditableTestIds {
  editBtn = 'avatarEditableButton',
  default = 'avatarEditableDefaultIcon',
  successImg = 'avatarEditableImage',
}
