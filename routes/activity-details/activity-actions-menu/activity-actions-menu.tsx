import { useAppSelector } from '@R/typed-hooks';
import { ACTIVITY_ACTIONS_MENU } from './const';
import DeleteActivityButton from './delete-activity-button/delete-activity-button';
import EditActivityButton from './edit-activity-button/edit-activity-button';
import MenuView from './menu-view/menu-view';
import type { ActivityActionsMenuProps } from './types';

export default function ActivityActionsMenu({ activity }: ActivityActionsMenuProps) {
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);

  if (userId !== activity.userId) return null;

  return (
    <DeleteActivityButton
      activity={activity}
      renderMenu={(deleteButton) => (
        <MenuView accessibilityLabel={ACTIVITY_ACTIONS_MENU[language].accessibilityLabel}>
          <EditActivityButton activity={activity} />
          {deleteButton}
        </MenuView>
      )}
    />
  );
}
