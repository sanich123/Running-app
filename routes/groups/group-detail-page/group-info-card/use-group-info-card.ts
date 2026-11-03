import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useJoinGroupMutation, useLeaveGroupMutation } from '@R/services/groups/groups';
import { useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { getIconNameByTypeOfSport } from '@U/icon-utils';
import { GROUP_CATEGORY_LABELS, GROUPS_COPY, getGroupSportLabels } from '../../const';
import type { GroupDetails } from '@R/services/groups/types';

export default function useGroupInfoCard(group: GroupDetails, isRefreshing: boolean) {
  const { id, privacy, sports: groupSports, currentMembership, isOwner: groupIsOwner, createdByUserId } = group;
  const router = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { colors } = useTheme();
  const { requestSent, saveError } = GROUPS_COPY[language];
  const categoryLabels = GROUP_CATEGORY_LABELS[language === LANGUAGES.english ? 'en' : 'ru'];
  const sportLabels = getGroupSportLabels(language);
  const [joinGroup, { data: joinResult, isLoading: isJoining, reset: resetJoinResult }] = useJoinGroupMutation({
    fixedCacheKey: `group-join-${id}`,
  });
  const [leaveGroup, { isLoading: isLeaving }] = useLeaveGroupMutation();
  const isOwner = groupIsOwner || Boolean(userId && createdByUserId === userId);
  const membership =
    isRefreshing && currentMembership === null && joinResult?.id === id
      ? joinResult.currentMembership
      : currentMembership;
  const isActiveMember = Boolean(membership?.status === 'active' || isOwner);
  const isPending = membership?.status === 'pending';
  const sports = groupSports.map((sport) => ({
    icon: getIconNameByTypeOfSport(sport),
    sport,
  }));
  const onJoin = async () => {
    try {
      await joinGroup(id).unwrap();
      if (privacy === 'closed') successToast(requestSent);
    } catch (error) {
      errorToast(saveError, error);
    }
  };
  const onLeave = async () => {
    try {
      await leaveGroup(id).unwrap();
      resetJoinResult();
      router.back();
    } catch (error) {
      errorToast(saveError, error);
    }
  };

  return {
    categoryLabels,
    colors,
    copy: GROUPS_COPY[language],
    isActiveMember,
    isJoining,
    isLeaving,
    isOwner,
    isPending,
    onJoin,
    onLeave,
    sportLabels,
    sports,
  };
}
