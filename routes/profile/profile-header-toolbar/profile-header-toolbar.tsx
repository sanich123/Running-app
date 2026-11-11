import { Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ROUTES, LABELS } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import ProfileHeaderActions from '@Routes/profile/profile-header-actions/profile-header-actions';
import { IOS_HEADER_ICON_COLOR } from '@S/header-icon-source';
import useUserSafetyActions from '@S/moderation/user-safety-menu/use-user-safety-actions';
import UserSafetyDialogs from '@S/moderation/user-safety-menu/user-safety-dialogs/user-safety-dialogs';
import type { ProfileHeaderToolbarProps } from './types';

export default function ProfileHeaderToolbar({ profileUserId }: ProfileHeaderToolbarProps) {
  const { push } = useRouter();
  const { userId: currentUserId } = useAppSelector(({ auth }) => auth);
  const { language } = useAppSelector(({ settings }) => settings);
  const actions = useUserSafetyActions(profileUserId ?? '');
  const showUserSafetyMenu =
    Platform.OS === 'ios' && Boolean(profileUserId && currentUserId && profileUserId !== currentUserId);
  const labels = LABELS[language];

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () =>
            Platform.OS === 'ios' ? null : (
              <ProfileHeaderActions profileUserId={profileUserId} currentUserId={currentUserId} />
            ),
          headerTitle: labels.profile,
          title: labels.profile,
        }}>
        {Platform.OS === 'ios' ? (
          <Stack.Toolbar placement="right">
            <Stack.Toolbar.Button
              icon="person.2"
              accessibilityLabel={labels.users}
              tintColor={IOS_HEADER_ICON_COLOR}
              onPress={() => push(`/${ROUTES.users}` as never)}
            />
            <Stack.Toolbar.Button
              icon="gearshape"
              accessibilityLabel={labels.settings}
              tintColor={IOS_HEADER_ICON_COLOR}
              onPress={() => push(`/${ROUTES.settings}` as never)}
            />
            {showUserSafetyMenu ? (
              <Stack.Toolbar.Menu
                icon="ellipsis"
                accessibilityLabel={actions.copy.menuLabel}
                tintColor={IOS_HEADER_ICON_COLOR}>
                <Stack.Toolbar.MenuAction icon="flag" onPress={actions.showReport}>
                  {actions.copy.report}
                </Stack.Toolbar.MenuAction>
                <Stack.Toolbar.MenuAction icon="person.crop.circle.badge.xmark" onPress={actions.showBlockConfirmation}>
                  {actions.copy.block}
                </Stack.Toolbar.MenuAction>
              </Stack.Toolbar.Menu>
            ) : null}
          </Stack.Toolbar>
        ) : null}
      </Stack.Screen>
      {showUserSafetyMenu ? (
        <UserSafetyDialogs
          userId={profileUserId ?? ''}
          copy={actions.copy}
          isReportVisible={actions.isReportVisible}
          isBlockConfirmationVisible={actions.isBlockConfirmationVisible}
          isLoading={actions.isLoading}
          onReportDismiss={actions.dismissReport}
          onBlockDismiss={actions.dismissBlockConfirmation}
          onBlockConfirm={() => void actions.confirmBlock()}
        />
      ) : null}
    </>
  );
}
