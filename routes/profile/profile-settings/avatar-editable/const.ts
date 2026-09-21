export interface AvatarIconEditableProps {
  isDisabled: boolean;
  setIsDisabled: (arg: boolean) => void;
}

export const enum AvatarEditableTestIds {
  editBtn = 'avatarEditableButton',
  default = 'avatarEditableDefaultIcon',
  successImg = 'avatarEditableImage',
  loading = 'avatarEditableLoading',
  uploadProgress = 'avatarEditableUploadProgress',
  editIcon = 'avatarEditableEditIcon',
}
