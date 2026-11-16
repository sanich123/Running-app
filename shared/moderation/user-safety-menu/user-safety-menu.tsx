import ContentActionsMenu from '@S/moderation/content-actions-menu/content-actions-menu';
import useUserSafetyActions from './use-user-safety-actions';
import UserSafetyDialogs from './user-safety-dialogs/user-safety-dialogs';
import type { UserSafetyMenuProps } from './types';

export default function UserSafetyMenu({ userId, iconColor, triggerBackgroundColor }: UserSafetyMenuProps) {
  const actions = useUserSafetyActions(userId);

  return (
    <>
      <ContentActionsMenu
        accessibilityLabel={actions.copy.menuLabel}
        iconColor={iconColor}
        triggerBackgroundColor={triggerBackgroundColor}
        testID="user-safety-menu-trigger"
        reportLabel={actions.copy.report}
        reportTestID="user-safety-report-profile"
        onReport={actions.showReport}
        blockLabel={actions.copy.block}
        blockTestID="user-safety-block-user"
        onBlock={actions.showBlockConfirmation}
      />
      <UserSafetyDialogs
        userId={userId}
        copy={actions.copy}
        isReportVisible={actions.isReportVisible}
        isBlockConfirmationVisible={actions.isBlockConfirmationVisible}
        isLoading={actions.isLoading}
        onReportDismiss={actions.dismissReport}
        onBlockDismiss={actions.dismissBlockConfirmation}
        onBlockConfirm={() => void actions.confirmBlock()}
      />
    </>
  );
}
