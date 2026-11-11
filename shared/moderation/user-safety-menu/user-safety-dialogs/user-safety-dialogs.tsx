import ConfirmDialog from '@S/confirm-dialog/confirm-dialog';
import ReportContentDialog from '@S/moderation/report-content-dialog/report-content-dialog';
import type { UserSafetyDialogsProps } from './types';

export default function UserSafetyDialogs({
  userId,
  copy,
  isReportVisible,
  isBlockConfirmationVisible,
  isLoading,
  onReportDismiss,
  onBlockDismiss,
  onBlockConfirm,
}: UserSafetyDialogsProps) {
  return (
    <>
      <ReportContentDialog visible={isReportVisible} targetType="user" targetId={userId} onDismiss={onReportDismiss} />
      <ConfirmDialog
        visible={isBlockConfirmationVisible}
        title={copy.blockTitle}
        message={copy.blockMessage}
        confirmText={copy.blockConfirm}
        cancelText={copy.cancel}
        loading={isLoading}
        onConfirm={onBlockConfirm}
        onDismiss={onBlockDismiss}
      />
    </>
  );
}
