import { lazy } from 'react';
import { ROUTES } from '@const/enums';

export const LazySaveBtn = lazy(() => import('@Routes/activity/save-btn/save-btn'));
export const LazyUsersSettingsIcons = lazy(() => import('@S/users-settings-icons/users-settings-icons'));

export const PUBLIC_ROUTES = new Set([
  `/${ROUTES.signIn}`,
  `/${ROUTES.loginFromUrl}`,
  `/${ROUTES.confirmEmailCode}`,
  `/${ROUTES.changePassword}`,
  `/${ROUTES.privacyPolicy}`,
  `/${ROUTES.legalInformation}`,
  `/${ROUTES.maintenance}`,
  `/${ROUTES.updateApp}`,
]);
