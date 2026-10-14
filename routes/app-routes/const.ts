import { lazy } from 'react';

export const LazyActivities = lazy(() => import('@Routes/activities/activities'));
export const LazyActivitiesList = lazy(() => import('@Routes/activities-list/activities-list'));
export const LazyActivity = lazy(() => import('@Routes/activity/activity'));
export const LazyActivityFullViewPage = lazy(() => import('@Routes/card-full-view/card-full-view'));
export const LazyAvatarIconEditable = lazy(() => import('@Routes/profile/profile-settings/avatar-editable/editable'));
export const LazyAvatarShowable = lazy(() => import('@S/avatar/showable/showable'));
export const LazyGenderBtns = lazy(() => import('@Routes/profile/profile-settings/gender-btns/gender-btns'));
export const LazyInputBio = lazy(() => import('@Routes/profile/profile-settings/input-bio/input-bio'));
export const LazyInputsNameSurname = lazy(
  () => import('@Routes/profile/profile-settings/inputs-name-surname/inputs-name-surname'),
);
export const LazyInputsWeightCity = lazy(
  () => import('@Routes/profile/profile-settings/inputs-weight-city/inputs-weight-city'),
);
export const LazyInputsHeightAge = lazy(
  () => import('@Routes/profile/profile-settings/inputs-height-age/inputs-height-age'),
);
export const LazyLegalInformation = lazy(() => import('@Routes/legal-information/legal-information'));
export const LazyLikesList = lazy(() => import('@Routes/likes-list/likes-list'));
export const LazyListOfFollowers = lazy(() => import('@Routes/followers-page/followers-page'));
export const LazyListOfFollowing = lazy(() => import('@Routes/followings-page/followings-page'));
export const LazyListOfUsers = lazy(() => import('@Routes/users-page/users-page'));
export const LazyMaintenance = lazy(() => import('@Routes/maintenance/maintenance'));
export const LazyMapPage = lazy(() => import('@Routes/map-page/map-page'));
export const LazyMediaGrid = lazy(() => import('@Routes/media-grid/media-grid'));
export const LazyMigrationFromStrava = lazy(() => import('@Routes/migration-from-strava/migration-from-strava'));
export const LazyMonthStatistics = lazy(() => import('@Routes/statistic/month-statistics/month-statistics'));
export const LazyPhotoViewer = lazy(() => import('@Routes/photo-viewer/photo-viewer'));
export const LazyPrivacyPolicy = lazy(() => import('@Routes/privacy-policy/privacy-policy'));
export const LazyProfileEditBtn = lazy(() => import('@Routes/profile/edit-btn/edit-btn'));
export const LazyProfilePage = lazy(() => import('@Routes/profile/profile'));
export const LazyProfilePrivacySettingsPage = lazy(
  () => import('@Routes/profile/privacy-settings/privacy-settings-page'),
);
export const LazyNotificationsPage = lazy(() => import('@Routes/notifications/notifications-page'));
export const LazyNotificationSettingsPage = lazy(() => import('@Routes/notifications/notification-settings-page'));
export const LazySaveResult = lazy(() => import('@Routes/save-activity-page/save-activity-page'));
export const LazySettingsPage = lazy(() => import('@Routes/settings-page/settings-page'));
export const LazyUsersSettingsIcons = lazy(() => import('@S/users-settings-icons/users-settings-icons'));

export const HOME_TAB_ROUTE = '(home)';
