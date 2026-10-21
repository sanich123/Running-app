import { useAppSelector } from '@R/typed-hooks';
import { ACTIVITY_ACTIONS_MENU, ACTIVITY_ACTIONS_MENU_TEST_IDS } from '../const';
import useEditActivityAction from './use-edit-activity-action';
import MenuItem from '../menu-item/menu-item';
import type { EditActivityButtonProps } from './types';

export default function EditActivityButton({ activity }: EditActivityButtonProps) {
  const onEditActivity = useEditActivityAction(activity);
  const { language } = useAppSelector(({ settings }) => settings);

  return (
    <MenuItem
      action="edit"
      label={ACTIVITY_ACTIONS_MENU[language].edit}
      testID={ACTIVITY_ACTIONS_MENU_TEST_IDS.edit}
      onPress={onEditActivity}
    />
  );
}
