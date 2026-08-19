import { MAX_MOBILE_WIDTH } from '@const/const';

const TAB_BAR_CLEARANCE = 64;
const DEFAULT_MARGIN = 16;

export const getFloatingButtonPosition = ({
  width,
  insets,
  overlapsTabBar,
}: {
  width: number;
  insets: { right: number; bottom: number };
  overlapsTabBar: boolean;
}) => ({
  right: Math.max((width - MAX_MOBILE_WIDTH) / 2, 0) + insets.right + DEFAULT_MARGIN,
  bottom: overlapsTabBar ? Math.max(TAB_BAR_CLEARANCE, insets.bottom + DEFAULT_MARGIN) : DEFAULT_MARGIN,
});
