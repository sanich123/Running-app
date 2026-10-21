import { lazy } from 'react';

export const LazyActivities = lazy(() => import('@Routes/activities/activities'));
export const LazyActivitiesList = lazy(() => import('@Routes/activities-list/activities-list'));
export const LazyActivity = lazy(() => import('@Routes/activity/activity'));
export const LazyActivityDetailsPage = lazy(() => import('@Routes/activity-details/activity-details'));
export const LazyActivityStatisticsPage = lazy(
  () => import('@Routes/activity-details/activity-statistics-page/activity-statistics-page'),
);
export const LazyAvatarIconEditable = lazy(
  () => import('@Routes/profile/profile-settings/avatar-editable/avatar-icon-editable/avatar-icon-editable'),
);
export const LazyAvatarShowable = lazy(() => import('@S/avatar/showable/avatar-showable/avatar-showable'));
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
export const LazyInputsHeartRate = lazy(
  () => import('@Routes/profile/profile-settings/inputs-heart-rate/inputs-heart-rate'),
);
export const LazyLegalInformation = lazy(
  () => import('@Routes/legal-information/legal-information-page/legal-information-page'),
);
export const LazyLikesList = lazy(() => import('@Routes/likes-list/likes-list'));
export const LazyListOfFollowers = lazy(() => import('@Routes/followers-page/list-of-followers/list-of-followers'));
export const LazyListOfFollowing = lazy(() => import('@Routes/followings-page/list-of-following/list-of-following'));
export const LazyListOfUsers = lazy(() => import('@Routes/users-page/list-of-users/list-of-users'));
export const LazyMaintenance = lazy(() => import('@Routes/maintenance/maintenance-page/maintenance-page'));
export const LazyMapPage = lazy(() => import('@Routes/map-page/map-page'));
export const LazyMediaGrid = lazy(() => import('@Routes/media-grid/media-grid'));
export const LazyMigrationFromStrava = lazy(() => import('@Routes/migration-from-strava/migration-from-strava'));
export const LazyMonthStatistics = lazy(() => import('@Routes/statistic/month-statistics/month-statistics'));
export const LazyPhotoViewer = lazy(() => import('@Routes/photo-viewer/photo-viewer'));
export const LazyPrivacyPolicy = lazy(() => import('@Routes/privacy-policy/privacy-policy-page/privacy-policy-page'));
export const LazyProfileEditBtn = lazy(() => import('@Routes/profile/edit-btn/edit-btn'));
export const LazyProfilePage = lazy(() => import('@Routes/profile/profile-page/profile-page'));
export const LazyProfilePrivacySettingsPage = lazy(
  () => import('@Routes/profile/privacy-settings/profile-privacy-settings-page/profile-privacy-settings-page'),
);
export const LazyNotificationsPage = lazy(() => import('@Routes/notifications/notifications-page/notifications-page'));
export const LazyNotificationSettingsPage = lazy(
  () => import('@Routes/notifications/notification-settings-page/notification-settings-page'),
);
export const LazySaveResult = lazy(() => import('@Routes/save-activity-page/save-result/save-result'));
export const LazySettingsPage = lazy(() => import('@Routes/settings-page/settings-page'));
export const LazyUsersSettingsIcons = lazy(() => import('@S/users-settings-icons/users-settings-icons'));

export const HOME_TAB_ROUTE = '(home)';
