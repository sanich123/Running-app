import { useState } from 'react';
import { useAppSelector } from '@R/typed-hooks';
import ReportContentDialog from '@S/moderation/report-content-dialog/report-content-dialog';
import { ACTIVITY_ACTIONS_MENU } from './const';
import DeleteActivityButton from './delete-activity-button/delete-activity-button';
import EditActivityButton from './edit-activity-button/edit-activity-button';
import MenuItem from './menu-item/menu-item';
import MenuView from './menu-view/menu-view';
import ActivityRouteActions from './route-actions/route-actions';
import type { ActivityActionsMenuProps } from './types';

export default function ActivityActionsMenu({ activity }: ActivityActionsMenuProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const isOwner = userId === activity.userId;

  if (!isOwner) {
    return (
      <>
        <MenuView accessibilityLabel={ACTIVITY_ACTIONS_MENU[language].accessibilityLabel}>
          <MenuItem
            action="report"
            label={ACTIVITY_ACTIONS_MENU[language].report}
            testID="activity-actions-menu-report"
            onPress={() => setIsReportVisible(true)}
          />
        </MenuView>
        <ReportContentDialog
          visible={isReportVisible}
          targetType="activity"
          targetId={activity.id}
          onDismiss={() => setIsReportVisible(false)}
        />
      </>
    );
  }

  return (
    <DeleteActivityButton
      activity={activity}
      renderMenu={(deleteButton) => (
        <MenuView accessibilityLabel={ACTIVITY_ACTIONS_MENU[language].accessibilityLabel}>
          <EditActivityButton activity={activity} />
          <ActivityRouteActions activity={activity} />
          {deleteButton}
        </MenuView>
      )}
    />
  );
}
