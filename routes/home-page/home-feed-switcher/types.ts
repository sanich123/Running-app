import type { HomeFeed } from '../const';

export interface HomeFeedSwitcherProps {
  value: HomeFeed;
  onValueChange: (value: HomeFeed) => void;
}
