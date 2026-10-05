import { lazy } from 'react';
import { ROUTES } from '@const/enums';

export const LazyUsersSettingsIcons = lazy(() => import('@S/users-settings-icons/users-settings-icons'));

export const PUBLIC_ROUTES = new Set([
  `/${ROUTES.signIn}`,
  `/${ROUTES.loginFromUrl}`,
  `/${ROUTES.confirmEmailCode}`,
  `/${ROUTES.changePassword}`,
  `/${ROUTES.privacyPolicy}`,
  `/${ROUTES.privacyPolicyEnglish}`,
  `/${ROUTES.consents}`,
  `/${ROUTES.consentsEnglish}`,
  `/${ROUTES.userAgreement}`,
  `/${ROUTES.userAgreementEnglish}`,
  `/${ROUTES.locationConsent}`,
  `/${ROUTES.locationConsentEnglish}`,
  `/${ROUTES.accountDeletion}`,
  `/${ROUTES.accountDeletionEnglish}`,
  `/${ROUTES.legalInformation}`,
  `/${ROUTES.legalInformationEnglish}`,
  `/${ROUTES.legal}`,
  `/${ROUTES.maintenance}`,
  `/${ROUTES.updateApp}`,
]);
