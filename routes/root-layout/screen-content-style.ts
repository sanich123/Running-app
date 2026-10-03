import type { ViewStyle } from 'react-native';
import { ROUTES } from '@const/enums';

export const ANDROID_BOTTOM_INSET_HANDLED_ROUTES: ReadonlySet<string> = new Set([
  ROUTES.tabs,
  `${ROUTES.likes}/${ROUTES.routeId}`,
  `${ROUTES.users}/${ROUTES.index}`,
  `${ROUTES.media}/${ROUTES.photoUrl}`,
  `${ROUTES.manualActivity}/${ROUTES.index}`,
]);

interface RootScreenContentStyleOptions {
  backgroundColor: string;
  bottomInset: number;
  platform: string;
  routeName: string;
}

export function getRootScreenContentStyle({
  backgroundColor,
  bottomInset,
  platform,
  routeName,
}: RootScreenContentStyleOptions): ViewStyle {
  if (platform !== 'android') return { backgroundColor };

  return {
    backgroundColor,
    paddingBottom: ANDROID_BOTTOM_INSET_HANDLED_ROUTES.has(routeName) ? 0 : bottomInset,
  };
}
