import { Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useDeleteGroupMutation } from '@R/services/groups/groups';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { GROUPS_COPY, getGroupShareUrl } from '../../const';
import type { GroupDetails } from '@R/services/groups/types';

export default function useGroupDetailHeaderActions(group?: GroupDetails) {
  const router = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const { saveError, groupDeleted, deleteGroupError } = GROUPS_COPY[language];
  const [deleteGroup, { isLoading: isDeletingGroup }] = useDeleteGroupMutation();

  const shareGroup = async () => {
    if (!group) return;

    try {
      const url = getGroupShareUrl(group.id);
      await Share.share({ title: group.name, message: `${group.name}\n${url}`, url });
    } catch (error) {
      errorToast(saveError, error);
    }
  };

  const deleteCurrentGroup = async () => {
    if (!group) return;

    try {
      await deleteGroup(group.id).unwrap();
      successToast(groupDeleted);
      router.replace('/groups' as never);
    } catch (error) {
      errorToast(deleteGroupError, error);
    }
  };

  return { copy: GROUPS_COPY[language], deleteCurrentGroup, isDeletingGroup, router, shareGroup };
}
