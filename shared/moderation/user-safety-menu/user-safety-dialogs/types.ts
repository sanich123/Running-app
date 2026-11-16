import type { USER_SAFETY_MENU_COPY } from '../const';

export type UserSafetyMenuCopy = (typeof USER_SAFETY_MENU_COPY)[keyof typeof USER_SAFETY_MENU_COPY];

export interface UserSafetyDialogsProps {
  userId: string;
  copy: UserSafetyMenuCopy;
  isReportVisible: boolean;
  isBlockConfirmationVisible: boolean;
  isLoading: boolean;
  onReportDismiss: () => void;
  onBlockDismiss: () => void;
  onBlockConfirm: () => void;
}
