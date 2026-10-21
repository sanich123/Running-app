import { useAppSelector } from '@R/typed-hooks';
import ConfirmDialog from '@S/confirm-dialog/confirm-dialog';
import { ACTIVITY_ACTIONS_MENU, ACTIVITY_ACTIONS_MENU_TEST_IDS } from '../const';
import useDeleteActivityAction from './use-delete-activity-action';
import MenuItem from '../menu-item/menu-item';
import type { DeleteActivityButtonProps } from './types';

export default function DeleteActivityButton({ activity, renderMenu }: DeleteActivityButtonProps) {
  const {
    isConfirmDialogVisible,
    isDeleteRequestLoading,
    isActivityOwner,
    confirmation,
    onConfirm,
    onDismiss,
    onPress,
  } = useDeleteActivityAction(activity);
  const { language } = useAppSelector(({ settings }) => settings);

  if (!isActivityOwner) return null;

  return (
    <>
      {renderMenu ? (
        renderMenu(
          <MenuItem
            action="delete"
            label={ACTIVITY_ACTIONS_MENU[language].delete}
            testID={ACTIVITY_ACTIONS_MENU_TEST_IDS.delete}
            onPress={onPress}
          />,
        )
      ) : (
        <MenuItem
          action="delete"
          label={ACTIVITY_ACTIONS_MENU[language].delete}
          testID={ACTIVITY_ACTIONS_MENU_TEST_IDS.delete}
          onPress={onPress}
        />
      )}
      <ConfirmDialog
        visible={isConfirmDialogVisible}
        title={confirmation.deleteActivity}
        message={confirmation.question}
        confirmText={confirmation.accept}
        cancelText={confirmation.cancel}
        destructive
        loading={isDeleteRequestLoading}
        onDismiss={onDismiss}
        onConfirm={onConfirm}
      />
    </>
  );
}
