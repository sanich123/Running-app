import { useState } from 'react';
import { useBlockUserMutation } from '@R/services/moderation/moderation';
import { useAppSelector } from '@R/typed-hooks';
import ConfirmDialog from '@S/confirm-dialog/confirm-dialog';
import { errorToast } from '@S/error-toast/error-toast';
import ContentActionsMenu from '@S/moderation/content-actions-menu/content-actions-menu';
import { successToast } from '@S/success-toast/success-toast';
import { USER_SAFETY_MENU_COPY } from './const';
import ReportContentDialog from '../report-content-dialog/report-content-dialog';
import type { UserSafetyMenuProps } from './types';

export default function UserSafetyMenu({ userId }: UserSafetyMenuProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = USER_SAFETY_MENU_COPY[language];
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [isBlockConfirmationVisible, setIsBlockConfirmationVisible] = useState(false);
  const [blockUser, { isLoading }] = useBlockUserMutation();

  const confirmBlock = async () => {
    try {
      await blockUser(userId).unwrap();
      setIsBlockConfirmationVisible(false);
      successToast(copy.blocked);
    } catch (error) {
      errorToast(copy.blockError, error);
    }
  };

  return (
    <>
      <ContentActionsMenu
        accessibilityLabel={copy.menuLabel}
        testID="user-safety-menu-trigger"
        reportLabel={copy.report}
        reportTestID="user-safety-report-profile"
        onReport={() => setIsReportVisible(true)}
        blockLabel={copy.block}
        blockTestID="user-safety-block-user"
        onBlock={() => setIsBlockConfirmationVisible(true)}
      />
      <ReportContentDialog
        visible={isReportVisible}
        targetType="user"
        targetId={userId}
        onDismiss={() => setIsReportVisible(false)}
      />
      <ConfirmDialog
        visible={isBlockConfirmationVisible}
        title={copy.blockTitle}
        message={copy.blockMessage}
        confirmText={copy.blockConfirm}
        cancelText={copy.cancel}
        loading={isLoading}
        onConfirm={() => void confirmBlock()}
        onDismiss={() => setIsBlockConfirmationVisible(false)}
      />
    </>
  );
}
