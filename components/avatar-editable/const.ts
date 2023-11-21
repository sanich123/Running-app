export type AvatarIconEditableProps = {
  image: string;
  isDisabled: boolean;
  setImage: (arg: string) => void;
  setPhotoUrl: (arg: string) => void;
  setIsDisabled: (arg: boolean) => void;
};

export const enum AvatarEditableTestIds {
  editBtn = 'avatarEditableButton',
  default = 'avatarEditableDefaultIcon',
  successImg = 'avatarEditableImage',
}
